import React, {
  memo,
  useId,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { prettyDateTime, prettyDay } from 'core/date';
import { Spinner } from 'ui';

import styles from './graph.module.css';
import {
  areaPath,
  linePath,
  nearestIndex,
  niceTicks,
  timeTicks,
  valueDomain,
} from './geometry';
import { gapLimit } from './series';

// Temperature is red above 0 °C and blue below. Every other value has one
// colour. The earlier years are grey, behind the period.
export const COLORS = {
  warm: '#d9453f',
  cold: '#2a78d6',
  humidity: '#1a9e70',
  wind: '#6250d6',
  pressure: '#c2477a',
  cloud: '#5f7d95',
};
const INK = '#52514e';
const MUTED = '#898781';
const GRID = '#ebeae5';
const AXIS = '#c3c2b7';

// What a value fills below its line, when the chart shows every snapshot.
const AREA = {
  temperature: 'zero',
  humidity: 'bottom',
  wind: 'bottom',
  cloud: 'bottom',
};

// Pixels. The scale is on the right.
const LEFT = 2;
const RIGHT = 44;
const PLOT_TOP = 6;
const PLOT_BOTTOM = 6;
// Room above the wind line for the direction arrows.
const ARROW_ROW = 16;
const ARROW_SPACING = 26;
// Points up. Turned to where the wind blows to.
const ARROW = 'M0,-5L3.5,4L0,2L-3.5,4Z';

function useWidth(ref) {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const observer = new ResizeObserver(([entry]) =>
      setWidth(Math.floor(entry.contentRect.width))
    );

    observer.observe(ref.current);

    return () => observer.disconnect();
  }, [ref]);

  return width;
}

function panelHeight(value, count) {
  if (count === 1) {
    return 260;
  }

  return value.key === 'temperature' ? 130 : 76;
}

const format = (number, value) => number.toFixed(value.decimals);

function colorOf(value, y) {
  if (value.key === 'temperature') {
    return y < 0 ? COLORS.cold : COLORS.warm;
  }

  return COLORS[value.key];
}

function WindArrow({ dir }) {
  return (
    <svg width="12" height="12" viewBox="-6 -6 12 12" aria-hidden="true">
      <path d={ARROW} fill={INK} transform={`rotate(${dir + 180})`} />
    </svg>
  );
}

/** The lines and areas of a panel. Kept apart, so moving over the chart
 *  only draws the crosshair again. */
const Plot = memo(function Plot({
  panel,
  scale,
  width,
  height,
  plot,
  span,
  maxGap,
  daily,
  compare,
}) {
  const clip = useId().replace(/[^\w-]/g, '');
  const { value, points, band } = panel;
  const { lo, hi, y, top } = scale;
  const x = (time) => plot.left + (time / span) * (plot.right - plot.left);
  const bottom = height - PLOT_BOTTOM;
  const isTemperature = value.key === 'temperature';
  const zero = y(Math.min(hi, Math.max(lo, 0)));
  // About one label per 28 pixels of height.
  const count = Math.max(2, Math.floor((bottom - top) / 28));
  let ticks = niceTicks(lo, hi, count);

  // A narrow range can fall between two round numbers.
  if (ticks.length < 2) {
    ticks = niceTicks(lo, hi, count * 2);
  }
  const area = !daily && !compare && AREA[value.key];
  // The lowest and highest value of each day, when the chart shows days.
  const dayRange =
    daily && !compare && points.some((point) => point.min !== point.max);

  const series = (color) => (
    <>
      {dayRange && (
        <path
          d={areaPath(
            points,
            maxGap,
            x,
            (point) => y(point.max),
            (point) => y(point.min)
          )}
          fill={color}
          opacity={0.18}
        />
      )}
      {area && (
        <path
          d={areaPath(
            points,
            maxGap,
            x,
            (point) => y(point.y),
            () => (area === 'zero' ? zero : bottom)
          )}
          fill={color}
          opacity={0.1}
        />
      )}
      <path
        d={linePath(points, maxGap, x, (point) => y(point.y))}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </>
  );

  const arrows = [];

  if (value.direction && !daily) {
    let last = -Infinity;

    for (const point of points) {
      const px = x(point.x);

      if (point.dir != null && px - last >= ARROW_SPACING) {
        last = px;
        arrows.push(
          <path
            key={point.x}
            d={ARROW}
            fill={INK}
            transform={`translate(${px.toFixed(1)} ${PLOT_TOP + ARROW_ROW / 2 - 1}) rotate(${point.dir + 180})`}
          />
        );
      }
    }
  }

  return (
    <>
      {ticks.map((tick) => (
        <g key={tick}>
          <line
            x1={plot.left}
            x2={plot.right}
            y1={y(tick)}
            y2={y(tick)}
            stroke={GRID}
          />
          <text x={plot.right + 6} y={y(tick) + 4} className={styles.tick}>
            {tick}
          </text>
        </g>
      ))}

      {compare && band && (
        <>
          <path
            d={areaPath(
              band,
              maxGap,
              x,
              (part) => y(part.hi),
              (part) => y(part.lo)
            )}
            fill={MUTED}
            opacity={0.22}
          />
          <path
            d={linePath(band, maxGap, x, (part) => y(part.mid))}
            fill="none"
            stroke={MUTED}
            strokeWidth={1.5}
            strokeDasharray="4 3"
          />
        </>
      )}

      {isTemperature ? (
        <>
          <clipPath id={`${clip}-warm`}>
            <rect x={0} y={0} width={width} height={zero} />
          </clipPath>
          <clipPath id={`${clip}-cold`}>
            <rect x={0} y={zero} width={width} height={height - zero} />
          </clipPath>
          {lo < 0 && hi > 0 && (
            <line
              x1={plot.left}
              x2={plot.right}
              y1={zero}
              y2={zero}
              stroke={MUTED}
              strokeDasharray="3 3"
            />
          )}
          <g clipPath={`url(#${clip}-warm)`}>{series(COLORS.warm)}</g>
          <g clipPath={`url(#${clip}-cold)`}>{series(COLORS.cold)}</g>
        </>
      ) : (
        series(COLORS[value.key])
      )}

      {arrows}
    </>
  );
});

function Panel({
  panel,
  height,
  width,
  plot,
  span,
  maxGap,
  focus,
  hovering,
  daily,
  compare,
  loading,
}) {
  const { value, points, band } = panel;
  const arrowRow = value.direction && !daily ? ARROW_ROW : 0;
  const scale = useMemo(() => {
    const domain = valueDomain(panel);

    if (!domain) {
      return null;
    }

    const [lo, hi] = domain;
    const top = PLOT_TOP + arrowRow;
    const size = height - top - PLOT_BOTTOM;

    return { lo, hi, top, y: (v) => top + ((hi - v) / (hi - lo || 1)) * size };
  }, [panel, height, arrowRow]);

  const index = nearestIndex(points, focus);
  const point =
    index >= 0 && Math.abs(points[index].x - focus) <= maxGap
      ? points[index]
      : null;
  const bandIndex = compare && band ? nearestIndex(band, focus) : -1;
  const part =
    bandIndex >= 0 && Math.abs(band[bandIndex].x - focus) <= maxGap
      ? band[bandIndex]
      : null;
  const focusX = plot.left + (focus / span) * (plot.right - plot.left);

  let extra = null;

  if (part) {
    extra = `vanlig ${format(part.mid, value)} (${format(part.lo, value)} til ${format(part.hi, value)})`;
  } else if (daily && !compare && point && point.min !== point.max) {
    extra = `${format(point.min, value)} til ${format(point.max, value)}`;
  }

  return (
    <div className={styles.panel}>
      <div className={styles.readout}>
        <span className={styles.label}>{value.label}</span>
        <span className={styles.value}>
          {point ? `${format(point.y, value)} ${value.unit}` : '–'}
        </span>
        {point?.dir != null && <WindArrow dir={point.dir} />}
        {extra && <span className={styles.extra}>{extra}</span>}
      </div>
      <svg
        className={styles.svg}
        width={width}
        height={height}
        aria-hidden="true"
      >
        {scale ? (
          <Plot
            panel={panel}
            scale={scale}
            width={width}
            height={height}
            plot={plot}
            span={span}
            maxGap={maxGap}
            daily={daily}
            compare={compare}
          />
        ) : (
          !loading && (
            <text
              x={(plot.left + plot.right) / 2}
              y={height / 2 + 4}
              textAnchor="middle"
              className={styles.none}
            >
              Ingen målinger i perioden
            </text>
          )
        )}
        {hovering && (
          <line
            x1={focusX}
            x2={focusX}
            y1={0}
            y2={height}
            stroke={INK}
            strokeWidth={1}
          />
        )}
        {hovering && point && scale && (
          <circle
            cx={plot.left + (point.x / span) * (plot.right - plot.left)}
            cy={scale.y(point.y)}
            r={4}
            fill={colorOf(value, point.y)}
            stroke="#fff"
            strokeWidth={2}
          />
        )}
      </svg>
    </div>
  );
}

function TimeAxis({ range, width, plot, span }) {
  const ticks = timeTicks(range, plot.right - plot.left);

  return (
    <svg className={styles.svg} width={width} height={22} aria-hidden="true">
      <line x1={plot.left} x2={plot.right} y1={0.5} y2={0.5} stroke={AXIS} />
      {ticks.map(({ x, label }) => {
        const px = plot.left + (x / span) * (plot.right - plot.left);
        // Labels at the ends stay inside the chart.
        const anchor =
          px < plot.left + 16
            ? 'start'
            : px > plot.right - 16
              ? 'end'
              : 'middle';

        return (
          <g key={x}>
            <line x1={px} x2={px} y1={0} y2={4} stroke={AXIS} />
            <text x={px} y={16} textAnchor={anchor} className={styles.tick}>
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

function Legend({ data, period, compare }) {
  const withBand = compare && data.panels.find((panel) => panel.band);

  if (withBand) {
    const [first, last] = withBand.bandYears;
    const years = first === last ? String(first) : `${first}–${last}`;

    return (
      <div className={styles.legend}>
        <span>
          <i className={styles.lineKey} />
          {new Date(data.range.to).getUTCFullYear()}
        </span>
        <span>
          <i className={styles.dashKey} />
          Median {years}
        </span>
        <span>
          <i className={styles.bandKey} />
          Laveste til høyeste {years}
        </span>
      </div>
    );
  }

  if (period.daily) {
    return (
      <div className={styles.legend}>
        <span>
          <i className={styles.lineKey} />
          Døgnmiddel
        </span>
        <span>
          <i className={styles.bandKey} />
          Laveste til høyeste i døgnet
        </span>
      </div>
    );
  }

  return null;
}

/**
 * The values of a period as panels under each other, on one time line. Moving
 * over the chart (or the arrow keys) shows every value at that time.
 *
 * @param {object} props
 * @param {object} props.data from chartPanels
 */
export default function Chart({ data, period, compare: compareOn, loading }) {
  const ref = useRef(null);
  const width = useWidth(ref);
  // Time since the start of the period that the user points at. Without it,
  // the chart shows the values at the end of the period.
  const [hover, setHover] = useState(null);

  const span = Math.max(1, data.range.to - data.range.from);
  // The same object while the width is the same, so the lines are not drawn
  // again on every move.
  const plot = useMemo(
    () => ({ left: LEFT, right: Math.max(LEFT + 1, width - RIGHT) }),
    [width]
  );
  const maxGap = gapLimit(period);
  const focus = hover ?? span;
  // "All" has no earlier years, so it is drawn as without compare.
  const compare = compareOn && Boolean(period.days);

  // The first panel with points gives the time on top, and the steps for the
  // arrow keys.
  const lead = data.panels.find((panel) => panel.points.length);
  const leadIndex = lead ? nearestIndex(lead.points, focus) : -1;
  const focusTime =
    leadIndex >= 0 ? data.range.from + lead.points[leadIndex].x : null;

  function moveTo(event) {
    const box = ref.current.getBoundingClientRect();
    const x =
      ((event.clientX - box.left - plot.left) / (plot.right - plot.left)) *
      span;

    setHover(Math.min(span, Math.max(0, x)));
  }

  function onKeyDown(event) {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[event.key];

    if (step && lead) {
      event.preventDefault();
      const index = Math.min(
        lead.points.length - 1,
        Math.max(0, leadIndex + step)
      );
      setHover(lead.points[index].x);
    } else if (event.key === 'Escape') {
      setHover(null);
    }
  }

  return (
    <div className={styles.chart}>
      <div className={styles.when}>
        {focusTime != null &&
          (period.daily ? prettyDay(focusTime) : prettyDateTime(focusTime))}
      </div>
      <div
        ref={ref}
        className={styles.panels}
        tabIndex={0}
        role="group"
        aria-label="Verdiene over tid. Piltastene flytter tidspunktet."
        onPointerDown={moveTo}
        onPointerMove={moveTo}
        // A finger lifted keeps the values on screen, so they can be read.
        onPointerLeave={(event) =>
          event.pointerType === 'mouse' && setHover(null)
        }
        onKeyDown={onKeyDown}
      >
        {width > 0 &&
          data.panels.map((panel) => (
            <Panel
              key={panel.value.key}
              panel={panel}
              height={panelHeight(panel.value, data.panels.length)}
              width={width}
              plot={plot}
              span={span}
              maxGap={maxGap}
              focus={focus}
              hovering={hover != null}
              daily={Boolean(period.daily)}
              compare={compare}
              loading={loading}
            />
          ))}
        {width > 0 && (
          <TimeAxis range={data.range} width={width} plot={plot} span={span} />
        )}
        {loading && (
          <div className={styles.status}>
            <Spinner size="20px" />
          </div>
        )}
      </div>
      <Legend data={data} period={period} compare={compare} />
    </div>
  );
}
