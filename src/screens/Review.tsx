import { motion } from 'motion/react';
import { AppleLogo } from '../components/AppleLogo';
import { CardArt } from '../components/CardArt';
import { Dot } from '../components/Dot';
import {
  ADDRESS,
  ITEM,
  PAYMENT,
  SHIPPING_OPTIONS,
  listing,
  orderTotals,
  usd,
  type Grade,
  type ShippingId,
} from '../data/order';

/**
 * Order review — the information screen. Everything a $1,900 transaction
 * needs, on one mobile viewport, in three type styles: 13px captions for
 * labels/metadata, 15px for content, 600 only on money. Sections are
 * separated by hairlines, not cards — one left edge top to bottom.
 */

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="text-[13px] leading-[1.4] text-smoke">{children}</div>;
}

function CostRow({
  label,
  value,
  emphasis = false,
}: {
  label: React.ReactNode;
  value: string;
  emphasis?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <span
        className={
          emphasis ? 'text-[15px] font-medium text-charcoal' : 'text-[13px] leading-[1.4] text-slate'
        }
      >
        {label}
      </span>
      <span
        className={
          emphasis
            ? 'tnum text-[17px] font-semibold text-charcoal'
            : 'tnum text-[13px] leading-[1.4] text-charcoal'
        }
      >
        {value}
      </span>
    </div>
  );
}

export function Review({
  grade,
  shipping,
  onShipping,
  onBack,
  onPay,
}: {
  grade: Grade;
  shipping: ShippingId;
  onShipping: (id: ShippingId) => void;
  onBack: () => void;
  onPay: () => void;
}) {
  const t = orderTotals(shipping, grade);
  const l = listing(grade);
  const selected = SHIPPING_OPTIONS.find((s) => s.id === shipping) ?? SHIPPING_OPTIONS[0];

  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <header className="flex h-14 shrink-0 items-center gap-1 border-b border-hairline px-2">
        <button
          onClick={onBack}
          aria-label="Back"
          className="flex h-11 w-11 items-center justify-center rounded-full text-charcoal focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
        >
          <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5" aria-hidden="true">
            <path
              d="M12.5 4.5 7 10l5.5 5.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
        <h1 className="text-[15px] font-medium leading-[1.4] text-charcoal">Checkout</h1>
      </header>

      <div className="flex-1 overflow-y-auto">
        {/* Item */}
        <section className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-16 w-14 shrink-0 items-center justify-center rounded-[12px] bg-tint">
            <CardArt width={38} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[15px] font-medium leading-[1.4] text-charcoal">
              {ITEM.name}
            </div>
            <div className="text-[13px] leading-[1.4] text-smoke">
              PSA {l.grade}
              <Dot />
              {ITEM.year}
              <Dot />
              {ITEM.number}
              <Dot />
              {ITEM.variant}
            </div>
            <div className="text-[13px] leading-[1.4] text-smoke">Cert #{l.cert}</div>
          </div>
          <div className="tnum shrink-0 text-[15px] font-semibold text-charcoal">
            {usd(t.item)}
          </div>
        </section>

        <hr className="border-hairline" />

        {/* Delivery */}
        <section className="px-4 py-4">
          <div className="flex items-baseline justify-between">
            <SectionLabel>Deliver to</SectionLabel>
            <button className="text-[13px] leading-[1.4] text-psa-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal">
              Edit
            </button>
          </div>
          <div className="mt-1.5 text-[15px] leading-[1.4] text-charcoal">{ADDRESS.name}</div>
          <div className="text-[15px] leading-[1.4] text-slate">
            {ADDRESS.line1}, {ADDRESS.line2}
          </div>
        </section>

        <hr className="border-hairline" />

        {/* Shipping — the one recalculating control on the screen */}
        <section className="px-4 py-4">
          <SectionLabel>Shipping</SectionLabel>
          <div role="radiogroup" aria-label="Shipping speed" className="mt-2 space-y-2">
            {SHIPPING_OPTIONS.map((opt) => {
              const active = opt.id === shipping;
              return (
                <button
                  key={opt.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => onShipping(opt.id)}
                  className={`flex min-h-11 w-full items-center gap-3 rounded-[12px] border px-3.5 py-2.5 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal ${
                    active ? 'border-charcoal bg-fog' : 'border-hairline'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full border ${
                      active ? 'border-charcoal' : 'border-[#cfcfcf]'
                    }`}
                  >
                    <motion.span
                      initial={false}
                      animate={{ scale: active ? 1 : 0 }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      className="h-2.5 w-2.5 rounded-full bg-charcoal"
                    />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[15px] font-medium leading-[1.4] text-charcoal">
                      {opt.label}
                    </span>
                    <span className="block text-[13px] leading-[1.4] text-smoke">
                      Arrives {opt.eta}
                    </span>
                  </span>
                  <span className="tnum text-[13px] leading-[1.4] text-charcoal">
                    {usd(opt.cents)}
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <hr className="border-hairline" />

        {/* Payment */}
        <section className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-tint">
            <AppleLogo className="h-[18px] w-[18px] text-charcoal" />
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-medium leading-[1.4] text-charcoal">Apple Pay</div>
            <div className="tnum text-[13px] leading-[1.4] text-smoke">
              {PAYMENT.label} ···· {PAYMENT.last4}
            </div>
          </div>
          <button className="text-[13px] leading-[1.4] text-psa-red focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal">
            Edit
          </button>
        </section>

        <hr className="border-hairline" />

        {/* Assurance — why this transaction is safe, in one row */}
        <section className="flex items-center gap-3 px-4 py-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-tint">
            <svg viewBox="0 0 20 20" fill="none" className="h-[18px] w-[18px]" aria-hidden="true">
              <path
                d="M10 2.2 4 4.6v4.6c0 3.9 2.6 6.7 6 8 3.4-1.3 6-4.1 6-8V4.6L10 2.2Z"
                stroke="#212121"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <path
                d="m7.4 9.9 1.9 1.9 3.3-3.6"
                stroke="#212121"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div className="flex-1">
            <div className="text-[15px] font-medium leading-[1.4] text-charcoal">
              PSA verified authentic
            </div>
            <div className="text-[13px] leading-[1.4] text-smoke">
              Ships insured
              <Dot />
              Signature on delivery
            </div>
          </div>
        </section>

      </div>

      {/* Pay bar — the costs ride with the button so the decision and its
          price are never separated by scroll */}
      <div className="sticky bottom-0 border-t border-hairline bg-paper/95 px-4 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 shadow-[0_-10px_28px_rgba(0,0,0,0.09)] backdrop-blur">
        <div className="space-y-2">
          <CostRow label="Item" value={usd(t.item)} />
          <CostRow
            label={
              <>
                Shipping
                <Dot />
                {selected.label}
              </>
            }
            value={usd(t.shipping)}
          />
          <CostRow label="Processing" value={usd(t.processing)} />
          <CostRow
            label={
              <>
                Sales tax
                <Dot />
                WA
              </>
            }
            value={usd(t.tax)}
          />
        </div>
        <div className="mt-3 border-t border-hairline pt-3">
          <CostRow label="Total" value={usd(t.total)} emphasis />
        </div>
        <motion.button
          whileTap={{ scale: 0.98 }}
          onClick={onPay}
          className="mt-4 flex h-12 w-full items-center justify-center gap-1.5 rounded-full bg-ink text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-charcoal"
        >
          <AppleLogo className="h-[17px] w-[17px]" />
          <span className="text-[17px] font-medium tracking-tight">Pay</span>
        </motion.button>
        <p className="mt-2.5 text-center text-[13px] leading-[1.4] text-smoke">
          Sales are final once the seller ships. Buyer protection applies to every order.
        </p>
      </div>
    </div>
  );
}
