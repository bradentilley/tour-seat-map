import { useState, useEffect } from 'react';
import { supabase } from './supabase';

const SALESPEOPLE = ['Chelsy', 'Marcie', 'Vanessa'];
const TOTAL_ROWS = 13;
const SEAT_SIZE = 60;
const AISLE_W = 22;
const ROW_LABEL_W = 28;
const SEAT_GAP = 5;

const TIER = {
  2: { price: 217, color: '#c9a84c', bg: 'rgba(201,168,76,0.15)', label: '$217' },
  3: { price: 167, color: '#5b8dee', bg: 'rgba(91,141,238,0.15)', label: '$167' },
  4: { price: 97,  color: '#3ecf8e', bg: 'rgba(62,207,142,0.15)', label: '$97'  },
};

const GRID = `${SEAT_SIZE}px ${SEAT_SIZE}px ${AISLE_W}px ${SEAT_SIZE}px ${SEAT_SIZE}px ${ROW_LABEL_W}px`;

// ── Seat ─────────────────────────────────────────────────────────────────────
function Seat({ row, col, booking, onClick }) {
  const tier = TIER[row];

  // Row 1 — guide/influencer reserved
  if (row === 1) {
    return (
      <div style={{
        width: SEAT_SIZE, height: SEAT_SIZE, borderRadius: 9,
        background: 'rgba(139,92,246,0.08)', border: '1.5px solid rgba(139,92,246,0.25)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 3,
      }}>
        <div style={{ fontSize: 10, color: 'rgba(139,92,246,0.5)', fontWeight: 600, letterSpacing: '0.5px' }}>{row}{col}</div>
        <div style={{ fontSize: 9, color: 'rgba(139,92,246,0.45)', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Guide</div>
      </div>
    );
  }

  // Rows 5–13 — GA
  if (!tier) {
    return (
      <div style={{
        width: SEAT_SIZE, height: SEAT_SIZE, borderRadius: 9,
        background: '#0d0f14', border: '1px solid #1a1f2a',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 3,
      }}>
        <div style={{ fontSize: 10, color: '#252a35', letterSpacing: '0.5px' }}>{row}{col}</div>
        <div style={{ fontSize: 14, color: '#252a35', fontWeight: 700, lineHeight: 1 }}>✕</div>
      </div>
    );
  }

  // Rows 2–4 — bookable premium
  const isBooked = !!booking;
  return (
    <div
      onClick={() => onClick({ row, col, booking })}
      style={{
        width: SEAT_SIZE, height: SEAT_SIZE, borderRadius: 9, cursor: 'pointer',
        background: isBooked ? tier.color : tier.bg,
        border: `2px solid ${isBooked ? tier.color : tier.color + '60'}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 2,
        transition: 'all 0.12s',
        boxShadow: isBooked ? `0 0 12px ${tier.color}55` : 'none',
      }}>
      <div style={{ fontSize: 10, color: isBooked ? 'rgba(0,0,0,0.5)' : tier.color + 'cc', fontWeight: 700, letterSpacing: '0.5px' }}>
        {row}{col}
      </div>
      {isBooked ? (
        <div style={{ fontSize: 10, color: 'rgba(0,0,0,0.75)', fontWeight: 800, maxWidth: SEAT_SIZE - 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center', padding: '0 3px' }}>
          {booking.guest_name.split(' ')[0]}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: tier.color + 'cc', fontWeight: 600 }}>{tier.label}</div>
      )}
    </div>
  );
}

// ── Bus Map ───────────────────────────────────────────────────────────────────
function BusMap({ bookings, onSeatClick }) {
  const bookingMap = {};
  bookings.forEach(b => { bookingMap[`${b.row_number}${b.seat_letter}`] = b; });

  const rowLabelColor = (row) => {
    if (row === 1) return 'rgba(139,92,246,0.4)';
    if (TIER[row]) return TIER[row].color + '70';
    return '#252a35';
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch' }}>
      {/* Front cap */}
      <div style={{ background: '#161921', border: '1px solid #252a35', borderRadius: '20px 20px 0 0', padding: '14px 0', textAlign: 'center', borderBottom: 'none' }}>
        <div style={{ fontSize: 11, color: '#6b7280', letterSpacing: '3px', textTransform: 'uppercase' }}>▲ Front · Driver</div>
      </div>

      {/* Grid */}
      <div style={{ background: '#161921', border: '1px solid #252a35', borderTop: 'none', borderBottom: 'none', padding: '10px 14px' }}>
        {/* Column labels */}
        <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: SEAT_GAP, marginBottom: 8 }}>
          {['A', 'B', '', 'C', 'D', ''].map((c, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 13, color: '#6b7280', fontWeight: 600, letterSpacing: '1px' }}>{c}</div>
          ))}
        </div>

        {/* Rows */}
        {Array.from({ length: TOTAL_ROWS }, (_, i) => i + 1).map(row => (
          <div key={row} style={{ display: 'grid', gridTemplateColumns: GRID, gap: SEAT_GAP, marginBottom: SEAT_GAP, alignItems: 'center' }}>
            <Seat row={row} col="A" booking={bookingMap[`${row}A`]} onClick={onSeatClick} />
            <Seat row={row} col="B" booking={bookingMap[`${row}B`]} onClick={onSeatClick} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: SEAT_SIZE }}>
              <div style={{ width: 2, height: '75%', background: '#1a1f2a', borderRadius: 1 }} />
            </div>
            <Seat row={row} col="C" booking={bookingMap[`${row}C`]} onClick={onSeatClick} />
            <Seat row={row} col="D" booking={bookingMap[`${row}D`]} onClick={onSeatClick} />
            <div style={{ fontSize: 12, color: rowLabelColor(row), textAlign: 'left', paddingLeft: 4, fontWeight: 600 }}>
              {row}
            </div>
          </div>
        ))}
      </div>

      {/* Rear cap */}
      <div style={{ background: '#161921', border: '1px solid #252a35', borderRadius: '0 0 20px 20px', padding: '14px 0', textAlign: 'center', borderTop: 'none' }}>
        <div style={{ fontSize: 11, color: '#6b7280', letterSpacing: '3px', textTransform: 'uppercase' }}>▼ Rear</div>
      </div>
    </div>
  );
}

// ── Booking Modal ─────────────────────────────────────────────────────────────
function BookingModal({ seat, booking, onBook, onCancel, onClose }) {
  const [name, setName]       = useState('');
  const [email, setEmail]     = useState('');
  const [soldBy, setSoldBy]   = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const tier = TIER[seat.row];
  const rowLabel = seat.row === 2 ? 'Front Row' : seat.row === 3 ? 'Second Row' : 'Third Row';

  async function handleBook() {
    if (!name.trim() || !email.trim() || !soldBy) {
      setError('Please fill in all fields and select a salesperson.');
      return;
    }
    setLoading(true);
    setError('');
    const result = await onBook({ name: name.trim(), email: email.trim(), soldBy });
    if (result?.error) { setError(result.error); setLoading(false); }
  }

  async function handleCancel() {
    setLoading(true);
    await onCancel(booking.id);
  }

  return (
    <div onClick={e => e.target === e.currentTarget && onClose()}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)', padding: '16px' }}>
      <div style={{ background: '#161921', border: '1px solid #252a35', borderRadius: 18, padding: 32, width: 420, maxWidth: '100%' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 10, background: tier.bg, border: `2px solid ${tier.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: tier.color, lineHeight: 1 }}>{seat.row}{seat.col}</div>
            <div style={{ fontSize: 11, color: tier.color + '99', marginTop: 3 }}>{tier.label}</div>
          </div>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#e8e4d9' }}>Seat {seat.row}{seat.col}</div>
            <div style={{ fontSize: 13, color: tier.color, marginTop: 3 }}>{rowLabel} · ${tier.price}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#6b7280', fontSize: 28, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>

        {booking ? (
          <>
            <div style={{ background: '#0d0f14', borderRadius: 10, padding: '16px 18px', marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>Current Booking</div>
              <div style={{ fontSize: 18, color: '#e8e4d9', fontWeight: 600, marginBottom: 4 }}>{booking.guest_name}</div>
              <div style={{ fontSize: 14, color: '#a0aab8', marginBottom: 12 }}>{booking.guest_email}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#6b7280' }}>
                <span>Sold by <span style={{ color: '#c9a84c' }}>{booking.salesperson}</span></span>
                <span>{new Date(booking.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <button onClick={handleCancel} disabled={loading}
              style={{ width: '100%', padding: '13px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.35)', borderRadius: 10, color: '#f87171', fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>
              {loading ? 'Cancelling…' : 'Cancel Booking & Free Seat'}
            </button>
            <button onClick={onClose}
              style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #252a35', borderRadius: 10, color: '#6b7280', fontSize: 13, cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Close
            </button>
          </>
        ) : (
          <>
            {error && (
              <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#f87171', marginBottom: 14, lineHeight: 1.5 }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Guest Name</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name"
                onKeyDown={e => e.key === 'Enter' && handleBook()}
                style={{ width: '100%', background: '#0d0f14', border: '1px solid #252a35', borderRadius: 9, padding: '11px 14px', color: '#e8e4d9', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Email</div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com"
                onKeyDown={e => e.key === 'Enter' && handleBook()}
                style={{ width: '100%', background: '#0d0f14', border: '1px solid #252a35', borderRadius: 9, padding: '11px 14px', color: '#e8e4d9', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>Sold By</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {SALESPEOPLE.map(s => (
                  <button key={s} onClick={() => setSoldBy(s)}
                    style={{ flex: 1, padding: '11px 4px', background: soldBy === s ? 'rgba(201,168,76,0.15)' : 'transparent', border: `1.5px solid ${soldBy === s ? 'rgba(201,168,76,0.5)' : '#252a35'}`, borderRadius: 8, color: soldBy === s ? '#c9a84c' : '#6b7280', fontSize: 14, cursor: 'pointer', transition: 'all 0.1s' }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleBook} disabled={loading}
              style={{ width: '100%', padding: '14px', background: loading ? 'rgba(201,168,76,0.05)' : 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 10, color: loading ? '#6b7280' : '#c9a84c', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>
              {loading ? 'Booking…' : `Confirm Booking · $${tier.price}`}
            </button>
            <button onClick={onClose}
              style={{ width: '100%', padding: '12px', background: 'transparent', border: '1px solid #252a35', borderRadius: 10, color: '#6b7280', fontSize: 13, cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Bus View ──────────────────────────────────────────────────────────────────
function BusView({ tour, bookings, activeBus, setActiveBus, onBack, onSeatClick }) {
  const busBookings   = bookings.filter(b => b.bus_number === activeBus);
  const premiumBooked = busBookings.filter(b => TIER[b.row_number]).length;
  const revenue       = busBookings.filter(b => TIER[b.row_number]).reduce((s, b) => s + TIER[b.row_number].price, 0);
  const total         = 12; // 3 rows × 4 seats

  return (
    <div style={{ minHeight: '100vh', padding: '28px 20px 64px' }}>
      <div style={{ maxWidth: 720, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
          <button onClick={onBack}
            style={{ background: 'transparent', border: '1px solid #252a35', borderRadius: 8, padding: '10px 16px', color: '#6b7280', fontSize: 13, cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', flexShrink: 0 }}>
            ← Tours
          </button>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 22, color: '#c9a84c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tour.name}
          </div>
        </div>

        {/* Bus tabs */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 22 }}>
          {[1, ...(tour.has_bus2 ? [2] : [])].map(bus => (
            <button key={bus} onClick={() => setActiveBus(bus)}
              style={{ padding: '10px 28px', background: activeBus === bus ? 'rgba(201,168,76,0.15)' : 'transparent', border: `1.5px solid ${activeBus === bus ? 'rgba(201,168,76,0.5)' : '#252a35'}`, borderRadius: 9, color: activeBus === bus ? '#c9a84c' : '#6b7280', fontSize: 14, cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', transition: 'all 0.12s' }}>
              Bus {bus}
            </button>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Premium Booked', value: `${premiumBooked} / ${total}`, color: '#c9a84c' },
            { label: 'Available',      value: total - premiumBooked,          color: '#3ecf8e' },
            { label: 'Revenue',        value: `$${revenue.toLocaleString()}`, color: '#5b8dee' },
          ].map(c => (
            <div key={c.label} style={{ background: '#161921', border: '1px solid #252a35', borderRadius: 12, padding: '16px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 11, color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>{c.label}</div>
              <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, fontWeight: 700, color: c.color }}>{c.value}</div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 18, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(139,92,246,0.4)', border: '1px solid rgba(139,92,246,0.4)' }} />
            <span style={{ fontSize: 13, color: '#6b7280' }}>Row 1 · Guide</span>
          </div>
          {Object.entries(TIER).map(([row, t]) => (
            <div key={row} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: t.color }} />
              <span style={{ fontSize: 13, color: '#6b7280' }}>Row {row} · {t.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: '#1a1f2a' }} />
            <span style={{ fontSize: 13, color: '#6b7280' }}>Rows 5–13 · GA</span>
          </div>
        </div>

        {/* Seat map — scrollable on narrow screens */}
        <div style={{ overflowX: 'auto', paddingBottom: 4 }}>
          <div style={{ display: 'flex', justifyContent: 'center', minWidth: 'fit-content' }}>
            <BusMap bookings={busBookings} onSeatClick={onSeatClick} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Tour List ─────────────────────────────────────────────────────────────────
function TourList({ tours, onSelectTour, onCreateTour, onToggleBus2 }) {
  const [newName, setNewName]         = useState('');
  const [creating, setCreating]       = useState(false);
  const [createError, setCreateError] = useState('');

  async function handleCreate(e) {
    e.preventDefault();
    if (!newName.trim() || creating) return;
    setCreating(true);
    setCreateError('');
    const err = await onCreateTour(newName.trim());
    if (err) setCreateError(err);
    else setNewName('');
    setCreating(false);
  }

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '48px 20px' }}>
      <div style={{ marginBottom: 40 }}>
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 32, color: '#c9a84c', marginBottom: 6, lineHeight: 1 }}>Tour Seat Manager</div>
        <div style={{ fontSize: 13, color: '#6b7280', letterSpacing: '2px', textTransform: 'uppercase' }}>Premium Front Seat Bookings</div>
      </div>

      {createError && (
        <div style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.3)', borderRadius: 9, padding: '12px 16px', fontSize: 13, color: '#f87171', marginBottom: 14, lineHeight: 1.5, wordBreak: 'break-all' }}>
          {createError}
        </div>
      )}

      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
        <input value={newName} onChange={e => setNewName(e.target.value)}
          placeholder="Tour name (e.g. Israel June 2027)"
          style={{ flex: 1, background: '#161921', border: '1px solid #252a35', borderRadius: 9, padding: '13px 16px', color: '#e8e4d9', fontSize: 16, fontFamily: 'inherit', outline: 'none' }} />
        <button type="submit" disabled={creating || !newName.trim()}
          style={{ background: creating || !newName.trim() ? 'transparent' : 'rgba(201,168,76,0.12)', border: `1.5px solid ${creating || !newName.trim() ? '#252a35' : 'rgba(201,168,76,0.4)'}`, borderRadius: 9, padding: '13px 20px', color: creating || !newName.trim() ? '#374151' : '#c9a84c', fontSize: 14, cursor: creating || !newName.trim() ? 'not-allowed' : 'pointer', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          {creating ? 'Adding…' : '+ Add'}
        </button>
      </form>

      {tours.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 0', color: '#374151', fontSize: 15 }}>
          No tours yet — add one above
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tours.map(tour => (
            <div key={tour.id} style={{ background: '#161921', border: '1px solid #252a35', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16 }}>
              <div style={{ flex: 1, cursor: 'pointer', minWidth: 0 }} onClick={() => onSelectTour(tour)}>
                <div style={{ fontSize: 17, color: '#e8e4d9', fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tour.name}
                </div>
                <div style={{ fontSize: 13, color: '#6b7280', letterSpacing: '0.5px' }}>
                  {tour.has_bus2 ? '2 buses · 24 premium seats' : '1 bus · 12 premium seats'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Bus 2</span>
                <div onClick={() => onToggleBus2(tour)}
                  style={{ width: 42, height: 24, borderRadius: 12, background: tour.has_bus2 ? '#c9a84c' : '#252a35', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'white', position: 'absolute', top: 4, left: tour.has_bus2 ? 22 : 4, transition: 'left 0.2s' }} />
                </div>
              </div>

              <button onClick={() => onSelectTour(tour)}
                style={{ background: 'rgba(91,141,238,0.1)', border: '1px solid rgba(91,141,238,0.3)', borderRadius: 8, padding: '10px 18px', color: '#5b8dee', fontSize: 13, cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0 }}>
                Open →
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Main App ──────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView]                 = useState('tours');
  const [tours, setTours]               = useState([]);
  const [selectedTour, setSelectedTour] = useState(null);
  const [activeBus, setActiveBus]       = useState(1);
  const [bookings, setBookings]         = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [appLoading, setAppLoading]     = useState(true);

  useEffect(() => {
    supabase.from('tours').select('*').order('created_at', { ascending: true })
      .then(({ data }) => { setTours(data || []); setAppLoading(false); });
  }, []);

  useEffect(() => {
    if (!selectedTour) return;

    async function loadBookings() {
      const { data } = await supabase.from('bookings').select('*')
        .eq('tour_id', selectedTour.id).eq('status', 'active');
      setBookings(data || []);
    }

    loadBookings();

    const channel = supabase
      .channel(`tour-${selectedTour.id}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bookings', filter: `tour_id=eq.${selectedTour.id}` },
        () => loadBookings())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedTour]);

  async function handleCreateTour(name) {
    const { data, error } = await supabase.from('tours').insert({ name }).select().single();
    if (error) return `${error.message} (code: ${error.code})`;
    if (data) setTours(prev => [...prev, data]);
  }

  async function handleToggleBus2(tour) {
    const { data, error } = await supabase.from('tours').update({ has_bus2: !tour.has_bus2 }).eq('id', tour.id).select().single();
    if (error) { console.error('Toggle bus2 failed:', error); return; }
    if (data) {
      setTours(prev => prev.map(t => t.id === tour.id ? data : t));
      if (selectedTour?.id === tour.id) setSelectedTour(data);
    }
  }

  async function handleBook({ name, email, soldBy }) {
    const { row, col } = selectedSeat;
    const { error } = await supabase.from('bookings').insert({
      tour_id: selectedTour.id, bus_number: activeBus,
      row_number: row, seat_letter: col,
      guest_name: name, guest_email: email,
      salesperson: soldBy, status: 'active',
    });
    if (error) {
      if (error.code === '23505') return { error: 'This seat was just booked by someone else. Please choose another.' };
      return { error: `Booking failed: ${error.message} (${error.code})` };
    }
    setSelectedSeat(null);
    return { success: true };
  }

  async function handleCancelBooking(bookingId) {
    await supabase.from('bookings').update({ status: 'cancelled' }).eq('id', bookingId);
    setSelectedSeat(null);
  }

  const selectedSeatBooking = selectedSeat
    ? bookings.find(b => b.row_number === selectedSeat.row && b.seat_letter === selectedSeat.col && b.bus_number === activeBus)
    : null;

  if (appLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0f14', color: '#6b7280', fontSize: 14, letterSpacing: '3px', textTransform: 'uppercase' }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0d0f14', color: '#e8e4d9', fontFamily: "'DM Mono', 'Courier New', monospace" }}>
      {view === 'tours' ? (
        <TourList tours={tours} onSelectTour={t => { setSelectedTour(t); setActiveBus(1); setBookings([]); setView('bus'); }}
          onCreateTour={handleCreateTour} onToggleBus2={handleToggleBus2} />
      ) : (
        <BusView tour={selectedTour} bookings={bookings} activeBus={activeBus} setActiveBus={setActiveBus}
          onBack={() => { setView('tours'); setSelectedTour(null); setBookings([]); setSelectedSeat(null); }}
          onSeatClick={({ row, col, booking }) => { if (row === 1 || row > 4) return; setSelectedSeat({ row, col, booking }); }} />
      )}
      {selectedSeat && (
        <BookingModal seat={selectedSeat} booking={selectedSeatBooking}
          onBook={handleBook} onCancel={handleCancelBooking} onClose={() => setSelectedSeat(null)} />
      )}
    </div>
  );
}
