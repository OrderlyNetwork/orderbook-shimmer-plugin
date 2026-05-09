/**
 * Orderbook plugin: alternating row colors (striped) + row background flash on data change.
 * Intercepts OrderBook.Desktop.Asks and OrderBook.Desktop.Bids; uses content-based diff
 * by display value (same precision as UI) so only rows whose visible value changed flash.
 */
import React, { useEffect, useMemo, useRef, type ComponentType } from "react";
import { getPrecisionByNumber } from "@orderly.network/utils";

const FLASH_ODD_CLASS = "orderbook-row-flash--odd";
const FLASH_EVEN_CLASS = "orderbook-row-flash--even";

type BasicSymbolInfo = {
  base_dp: number;
  quote_dp: number;
  base_tick: number;
  base: string;
  quote: string;
};

export type OrderBookShimmerPluginOptions = {
  /**
   * Row flash "from" color during animation.
   * Should be a valid CSS color string (e.g. `rgba(...)`, `#rrggbb`).
   */
  animationHighlightColor: string;
  /**
   * Even row base background color + flash "to" color for even rows.
   * Should be a valid CSS color string (e.g. `rgba(...)`, `rgb(...)`).
   */
  stripedRowBackgroundColor: string;
};

/** Delay per row index (ms) so flash cascades in list order instead of all at once */
const FLASH_DELAY_PER_INDEX_MS = 35;

/** Props shape for OrderBook.Desktop list components (SDK passes this through interceptors). */
export interface OrderBookListProps {
  data: number[][] | any[];
  symbolInfo?: BasicSymbolInfo;
  depth?: string;
}

type RowDisplayKey = [number, number];

/**
 * Convert raw orderbook row values into stable "display keys" so we can diff by what the
 * UI actually shows (precision-based).
 *
 * Note: we intentionally use numeric rounding (DP) here to keep the diff path fast under frequent updates.
 */
function roundToDp(value: number, factor: number): number {
  // Round to match UI precision without allocating strings.
  return Math.round(value * factor) / factor;
}

function getRowDisplayKey(
  row: number[],
  dp: number | undefined,
  idx: number,
  factor: number | undefined,
): number | undefined {
  const value = row?.[idx];
  // Return `undefined` for empty/invalid cells so empty rows can be ignored during diffing.
  if (value == null || !Number.isFinite(value)) return undefined;
  // If dp is missing or too large, fall back to raw value to avoid numeric overflow.
  if (dp == null || factor == null) return value;
  return roundToDp(value, factor);
}

/**
 * Wrapper that adds striped rows (via CSS class on container) and applies
 * flash class to rows whose displayed value changed; removes flash class on animationend (delegated).
 * Uses useOrderBookContext for depth/symbolInfo so comparison matches UI precision.
 */
export function OrderBookListWrapper<P extends OrderBookListProps>({
  Original,
  props,
  pluginOptions,
}: {
  Original: ComponentType<P>;
  props: P;
  pluginOptions: OrderBookShimmerPluginOptions;
}) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const prevDisplayKeysRef = useRef<Array<RowDisplayKey | undefined>>([]);
  const nextDisplayKeysRef = useRef<Array<RowDisplayKey | undefined>>([]);
  const listRef = useRef<HTMLElement | null>(null);
  const changedIndicesRef = useRef<number[]>([]);
  const { depth, symbolInfo } = props;

  // Drive styling via CSS vars so we keep the diff/animation logic fast.
  const wrapperStyle = useMemo(
    () =>
      ({
        "--orderbook-shimmer-highlight-color":
          pluginOptions.animationHighlightColor,
        "--orderbook-shimmer-stripe-color":
          pluginOptions.stripedRowBackgroundColor,
      }) as React.CSSProperties,
    [pluginOptions],
  );

  /** Same precision as desktop cell: price from depth/quote_dp, size from base_dp */
  const { priceDp, sizeDp } = useMemo(() => {
    if (!symbolInfo) return { priceDp: undefined, sizeDp: undefined };
    const priceDpVal = getPrecisionByNumber(
      depth ?? `${symbolInfo.quote_dp ?? 2}`,
    );
    const sizeDpVal = symbolInfo.base_dp ?? 2;
    return { priceDp: priceDpVal, sizeDp: sizeDpVal };
  }, [depth, symbolInfo]);

  // Precompute rounding factors for the diff path.
  // If dp is very large, rounding factors may overflow; in that case we skip rounding.
  const roundingFactors = useMemo(() => {
    const maxDp = 12;
    const canRound =
      priceDp != null &&
      sizeDp != null &&
      priceDp >= 0 &&
      sizeDp >= 0 &&
      priceDp <= maxDp &&
      sizeDp <= maxDp;
    if (!canRound)
      return {
        priceFactor: undefined as number | undefined,
        sizeFactor: undefined as number | undefined,
      };
    return {
      priceFactor: 10 ** priceDp,
      sizeFactor: 10 ** sizeDp,
    };
  }, [priceDp, sizeDp]);

  // When precision changes, cached display keys are no longer comparable.
  useEffect(() => {
    prevDisplayKeysRef.current = [];
    nextDisplayKeysRef.current = [];
  }, [priceDp, sizeDp]);

  // Delegate animation cleanup to the wrapper so we don't depend on OrderBook's internal DOM timing.
  useEffect(() => {
    const wrapper = wrapperRef.current;

    const handler = (e: AnimationEvent) => {
      const targetEl = e.target as HTMLElement | null;
      if (!targetEl) return;
      const rowEl = targetEl.closest(
        `.${FLASH_ODD_CLASS},.${FLASH_EVEN_CLASS}`,
      ) as HTMLElement | null;
      if (!rowEl) return;
      rowEl.classList.remove(FLASH_ODD_CLASS, FLASH_EVEN_CLASS);
      rowEl.style.animationDelay = "";
    };
    if (!wrapper) return;
    wrapper.addEventListener("animationend", handler);
    return () => wrapper.removeEventListener("animationend", handler);
  }, []);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const currData = Array.isArray(props.data)
      ? (props.data as number[][])
      : [];
    const prevDisplayKeys = prevDisplayKeysRef.current;
    const prevHadData = prevDisplayKeys.length > 0;

    const currLen = currData.length;
    const changedIndices = changedIndicesRef.current;
    changedIndices.length = 0;
    const nextDisplayKeys = nextDisplayKeysRef.current;
    nextDisplayKeys.length = currLen;

    for (let i = 0; i < currLen; i++) {
      const row = currData[i];
      if (!row || row.length < 2) {
        nextDisplayKeys[i] = undefined;
        continue;
      }

      const currPriceKey = getRowDisplayKey(
        row,
        priceDp,
        0,
        roundingFactors.priceFactor,
      );
      const currSizeKey = getRowDisplayKey(
        row,
        sizeDp,
        1,
        roundingFactors.sizeFactor,
      );
      // If either side is empty/invalid, treat the whole row as empty and skip diffing.
      if (currPriceKey == null || currSizeKey == null) {
        nextDisplayKeys[i] = undefined;
        continue;
      }

      nextDisplayKeys[i] = [currPriceKey, currSizeKey];

      if (prevHadData) {
        const prevKey = prevDisplayKeys[i];
        if (
          !prevKey ||
          prevKey[0] !== currPriceKey ||
          prevKey[1] !== currSizeKey
        ) {
          changedIndices.push(i);
        }
      }
    }

    // Update cached keys last so we can correctly detect "initial mount" (prevHadData).
    prevDisplayKeysRef.current = nextDisplayKeys;
    nextDisplayKeysRef.current = prevDisplayKeys;

    if (!prevHadData) return; // skip flash on initial mount / first precision change
    if (changedIndices.length === 0) return;

    // Initialize list ref once; orderbook DOM is likely stable between data updates.
    if (listRef.current && !listRef.current.isConnected) {
      listRef.current = null;
    }
    if (!listRef.current && wrapper) {
      listRef.current = wrapper.querySelector(
        ".oui-order-book-list",
      ) as HTMLElement | null;
    }
    const list = listRef.current;
    if (!list) return;

    for (const i of changedIndices) {
      const el = list.children[i];
      if (!el || !(el instanceof HTMLElement)) continue;

      const delayMs = i * FLASH_DELAY_PER_INDEX_MS;
      // Ensure the animation restarts even if this row is already flashing from a previous update.
      el.classList.remove(FLASH_ODD_CLASS, FLASH_EVEN_CLASS);
      el.style.animationDelay = `${delayMs}ms`;
      el.classList.add(i % 2 === 0 ? FLASH_ODD_CLASS : FLASH_EVEN_CLASS);
    }
  }, [props.data, priceDp, sizeDp]);

  return (
    <div
      ref={wrapperRef}
      className="orderbook-plugin-striped oui-size-full"
      style={wrapperStyle}
    >
      <Original {...props} />
    </div>
  );
}
