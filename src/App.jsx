import { useState, useEffect } from 'react';
import { supabase } from './supabase';

const SALESPEOPLE = ['Chelsy', 'Marcie', 'Vanessa'];
const TOTAL_ROWS = 13;
const SEAT_SIZE = 60;
const AISLE_W = 22;
const ROW_LABEL_W = 28;
const SEAT_GAP = 5;
const GRID = `${SEAT_SIZE}px ${SEAT_SIZE}px ${AISLE_W}px ${SEAT_SIZE}px ${SEAT_SIZE}px ${ROW_LABEL_W}px`;

const TIER = {
  2: { price: 217, color: '#b8860b', bg: 'rgba(184,134,11,0.10)', label: '$217' },
  3: { price: 167, color: '#2563eb', bg: 'rgba(37,99,235,0.09)',  label: '$167' },
  4: { price: 97,  color: '#16a34a', bg: 'rgba(22,163,74,0.09)',  label: '$97'  },
};

// ── Seat ─────────────────────────────────────────────────────────────────────
function Seat({ row, col, booking, onClick }) {
  const tier = TIER[row];

  if (row === 1) {
    return (
      <div style={{
        width: SEAT_SIZE, height: SEAT_SIZE, borderRadius: 9,
        background: 'rgba(139,92,246,0.07)', border: '1.5px solid rgba(139,92,246,0.22)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
      }}>
        <div style={{ fontSize: 10, color: 'rgba(109,40,217,0.6)', fontWeight: 700, letterSpacing: '0.5px' }}>{row}{col}</div>
        <div style={{ fontSize: 9, color: 'rgba(109,40,217,0.5)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Guide</div>
      </div>
    );
  }

  if (!tier) {
    return (
      <div style={{
        width: SEAT_SIZE, height: SEAT_SIZE, borderRadius: 9,
        background: '#f1f3f5', border: '1px solid #e5e7eb',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3,
      }}>
        <div style={{ fontSize: 10, color: '#ced4da', letterSpacing: '0.5px' }}>{row}{col}</div>
        <div style={{ fontSize: 14, color: '#ced4da', fontWeight: 700, lineHeight: 1 }}>✕</div>
      </div>
    );
  }

  const isBooked = !!booking;
  return (
    <div
      onClick={() => onClick({ row, col, booking })}
      style={{
        width: SEAT_SIZE, height: SEAT_SIZE, borderRadius: 9, cursor: 'pointer',
        background: isBooked ? tier.color : tier.bg,
        border: `2px solid ${isBooked ? tier.color : tier.color + '55'}`,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2,
        transition: 'all 0.12s',
        boxShadow: isBooked ? `0 2px 10px ${tier.color}44` : 'none',
      }}>
      <div style={{ fontSize: 10, color: isBooked ? 'rgba(255,255,255,0.85)' : tier.color, fontWeight: 700, letterSpacing: '0.5px' }}>
        {row}{col}
      </div>
      {isBooked ? (
        <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.9)', fontWeight: 800, maxWidth: SEAT_SIZE - 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', textAlign: 'center', padding: '0 3px' }}>
          {booking.guest_name.split(' ')[0]}
        </div>
      ) : (
        <div style={{ fontSize: 11, color: tier.color, fontWeight: 600 }}>{tier.label}</div>
      )}
    </div>
  );
}

// ── Bus Map ───────────────────────────────────────────────────────────────────
function BusMap({ bookings, onSeatClick }) {
  const bookingMap = {};
  bookings.forEach(b => { bookingMap[`${b.row_number}${b.seat_letter}`] = b; });

  const rowLabelColor = (row) => {
    if (row === 1) return 'rgba(109,40,217,0.35)';
    if (TIER[row]) return TIER[row].color + '80';
    return '#ced4da';
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'stretch' }}>
      <div style={{ background: '#e9ecef', border: '1px solid #dee2e6', borderRadius: '18px 18px 0 0', padding: '12px 0', textAlign: 'center', borderBottom: 'none' }}>
        <div style={{ fontSize: 11, color: '#6c757d', letterSpacing: '3px', textTransform: 'uppercase' }}>▲ Front · Driver</div>
      </div>

      <div style={{ background: '#ffffff', border: '1px solid #dee2e6', borderTop: 'none', borderBottom: 'none', padding: '10px 14px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: GRID, gap: SEAT_GAP, marginBottom: 8 }}>
          {['A', 'B', '', 'C', 'D', ''].map((c, i) => (
            <div key={i} style={{ textAlign: 'center', fontSize: 13, color: '#6c757d', fontWeight: 700, letterSpacing: '1px' }}>{c}</div>
          ))}
        </div>

        {Array.from({ length: TOTAL_ROWS }, (_, i) => i + 1).map(row => (
          <div key={row} style={{ display: 'grid', gridTemplateColumns: GRID, gap: SEAT_GAP, marginBottom: SEAT_GAP, alignItems: 'center' }}>
            <Seat row={row} col="A" booking={bookingMap[`${row}A`]} onClick={onSeatClick} />
            <Seat row={row} col="B" booking={bookingMap[`${row}B`]} onClick={onSeatClick} />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: SEAT_SIZE }}>
              <div style={{ width: 2, height: '75%', background: '#e9ecef', borderRadius: 1 }} />
            </div>
            <Seat row={row} col="C" booking={bookingMap[`${row}C`]} onClick={onSeatClick} />
            <Seat row={row} col="D" booking={bookingMap[`${row}D`]} onClick={onSeatClick} />
            <div style={{ fontSize: 12, color: rowLabelColor(row), textAlign: 'left', paddingLeft: 4, fontWeight: 600 }}>
              {row}
            </div>
          </div>
        ))}
      </div>

      <div style={{ background: '#e9ecef', border: '1px solid #dee2e6', borderRadius: '0 0 18px 18px', padding: '12px 0', textAlign: 'center', borderTop: 'none' }}>
        <div style={{ fontSize: 11, color: '#6c757d', letterSpacing: '3px', textTransform: 'uppercase' }}>▼ Rear</div>
      </div>
    </div>
  );
}

// ── Single Bus Panel ──────────────────────────────────────────────────────────
function BusPanel({ busNumber, bookings, onSeatClick }) {
  const premiumBooked = bookings.filter(b => TIER[b.row_number]).length;
  const revenue       = bookings.filter(b => TIER[b.row_number]).reduce((s, b) => s + TIER[b.row_number].price, 0);
  const total         = 12;

  return (
    <div style={{ flex: '1 1 360px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#374151', letterSpacing: '2px', textTransform: 'uppercase' }}>
        Bus {busNumber}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, width: '100%', maxWidth: 360 }}>
        {[
          { label: 'Booked',    value: `${premiumBooked} / ${total}`, color: '#b8860b' },
          { label: 'Available', value: total - premiumBooked,          color: '#16a34a' },
          { label: 'Revenue',   value: `$${revenue.toLocaleString()}`, color: '#2563eb' },
        ].map(c => (
          <div key={c.label} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '12px 10px', textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#9ca3af', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 6 }}>{c.label}</div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, fontWeight: 700, color: c.color }}>{c.value}</div>
          </div>
        ))}
      </div>

      <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
        <BusMap bookings={bookings} onSeatClick={onSeatClick} />
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

  const tier     = TIER[seat.row];
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
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(4px)', padding: 16 }}>
      <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 18, padding: 32, width: 420, maxWidth: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }}>

        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{ width: 56, height: 56, borderRadius: 10, background: tier.bg, border: `2px solid ${tier.color}`, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: tier.color }}>{seat.row}{seat.col}</div>
            <div style={{ fontSize: 11, color: tier.color + 'aa', marginTop: 2 }}>{tier.label}</div>
          </div>
          <div>
            <div style={{ fontFamily: 'Georgia, serif', fontSize: 20, color: '#111827' }}>
              Seat {seat.row}{seat.col} · Bus {seat.busNumber}
            </div>
            <div style={{ fontSize: 13, color: tier.color, marginTop: 3, fontWeight: 600 }}>{rowLabel} · ${tier.price}</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', color: '#9ca3af', fontSize: 28, cursor: 'pointer', lineHeight: 1, padding: '0 4px' }}>×</button>
        </div>

        {booking ? (
          <>
            <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 10, padding: '16px 18px', marginBottom: 18 }}>
              <div style={{ fontSize: 11, color: '#9ca3af', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>Current Booking</div>
              <div style={{ fontSize: 18, color: '#111827', fontWeight: 600, marginBottom: 4 }}>{booking.guest_name}</div>
              <div style={{ fontSize: 14, color: '#6b7280', marginBottom: 12 }}>{booking.guest_email}</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#9ca3af' }}>
                <span>Sold by <span style={{ color: '#b8860b', fontWeight: 600 }}>{booking.salesperson}</span></span>
                <span>{new Date(booking.created_at).toLocaleDateString()}</span>
              </div>
            </div>
            <button onClick={handleCancel} disabled={loading}
              style={{ width: '100%', padding: 13, background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 10, color: '#dc2626', fontSize: 13, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>
              {loading ? 'Cancelling…' : 'Cancel Booking & Free Seat'}
            </button>
            <button onClick={onClose}
              style={{ width: '100%', padding: 12, background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 10, color: '#6b7280', fontSize: 13, cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase' }}>
              Close
            </button>
          </>
        ) : (
          <>
            {error && (
              <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 8, padding: '11px 14px', fontSize: 13, color: '#dc2626', marginBottom: 14, lineHeight: 1.5 }}>
                {error}
              </div>
            )}
            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 12, color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Guest Name</div>
              <input value={name} onChange={e => setName(e.target.value)} placeholder="Full name"
                onKeyDown={e => e.key === 'Enter' && handleBook()}
                style={{ width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 9, padding: '11px 14px', color: '#111827', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 18 }}>
              <div style={{ fontSize: 12, color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 7 }}>Email</div>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="email@example.com"
                onKeyDown={e => e.key === 'Enter' && handleBook()}
                style={{ width: '100%', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 9, padding: '11px 14px', color: '#111827', fontSize: 15, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }} />
            </div>
            <div style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 12, color: '#6b7280', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10 }}>Sold By</div>
              <div style={{ display: 'flex', gap: 10 }}>
                {SALESPEOPLE.map(s => (
                  <button key={s} onClick={() => setSoldBy(s)}
                    style={{ flex: 1, padding: '11px 4px', background: soldBy === s ? 'rgba(184,134,11,0.08)' : '#f9fafb', border: `1.5px solid ${soldBy === s ? '#b8860b' : '#e5e7eb'}`, borderRadius: 8, color: soldBy === s ? '#b8860b' : '#6b7280', fontSize: 14, cursor: 'pointer', transition: 'all 0.1s', fontFamily: 'inherit', fontWeight: soldBy === s ? 700 : 400 }}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={handleBook} disabled={loading}
              style={{ width: '100%', padding: 14, background: loading ? '#f9fafb' : 'rgba(184,134,11,0.10)', border: `1.5px solid ${loading ? '#e5e7eb' : '#b8860b'}`, borderRadius: 10, color: loading ? '#9ca3af' : '#b8860b', fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 10, fontFamily: 'inherit', fontWeight: 600 }}>
              {loading ? 'Booking…' : `Confirm Booking · $${tier.price}`}
            </button>
            <button onClick={onClose}
              style={{ width: '100%', padding: 12, background: 'transparent', border: '1px solid #e5e7eb', borderRadius: 10, color: '#6b7280', fontSize: 13, cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: 'inherit' }}>
              Cancel
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ── Bus View ──────────────────────────────────────────────────────────────────
function BusView({ tour, bookings, onBack, onSeatClick }) {
  const buses = [1, ...(tour.has_bus2 ? [2] : [])];

  return (
    <div style={{ minHeight: '100vh', padding: '28px 20px 64px' }}>
      <div style={{ maxWidth: 900, margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <button onClick={onBack}
            style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 8, padding: '10px 16px', color: '#6b7280', fontSize: 13, cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', flexShrink: 0, fontFamily: 'inherit' }}>
            ← Tours
          </button>
          <div style={{ fontFamily: 'Georgia, serif', fontSize: 24, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {tour.name}
          </div>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: 20, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center', padding: '12px 16px', background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: 'rgba(109,40,217,0.25)', border: '1px solid rgba(109,40,217,0.3)' }} />
            <span style={{ fontSize: 13, color: '#6b7280' }}>Row 1 · Guide</span>
          </div>
          {Object.entries(TIER).map(([row, t]) => (
            <div key={row} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 12, height: 12, borderRadius: 3, background: t.color }} />
              <span style={{ fontSize: 13, color: '#6b7280' }}>Row {row} · {t.label}</span>
            </div>
          ))}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 12, height: 12, borderRadius: 3, background: '#e5e7eb' }} />
            <span style={{ fontSize: 13, color: '#6b7280' }}>Rows 5–13 · GA</span>
          </div>
        </div>

        {/* Bus panels — side by side on wide screens, stacked on mobile */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 32, justifyContent: 'center' }}>
          {buses.map(bus => (
            <BusPanel
              key={bus}
              busNumber={bus}
              bookings={bookings.filter(b => b.bus_number === bus)}
              onSeatClick={(seatData) => onSeatClick({ ...seatData, busNumber: bus })}
            />
          ))}
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
        <div style={{ fontFamily: 'Georgia, serif', fontSize: 32, color: '#111827', marginBottom: 6, lineHeight: 1 }}>Tour Seat Manager</div>
        <div style={{ fontSize: 13, color: '#9ca3af', letterSpacing: '2px', textTransform: 'uppercase' }}>Premium Front Seat Bookings</div>
      </div>

      {createError && (
        <div style={{ background: '#fff5f5', border: '1px solid #fca5a5', borderRadius: 9, padding: '12px 16px', fontSize: 13, color: '#dc2626', marginBottom: 14, lineHeight: 1.5 }}>
          {createError}
        </div>
      )}

      <form onSubmit={handleCreate} style={{ display: 'flex', gap: 10, marginBottom: 32 }}>
        <input value={newName} onChange={e => setNewName(e.target.value)}
          placeholder="Tour name (e.g. Israel June 2027)"
          style={{ flex: 1, background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 9, padding: '13px 16px', color: '#111827', fontSize: 16, fontFamily: 'inherit', outline: 'none', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }} />
        <button type="submit" disabled={creating || !newName.trim()}
          style={{ background: creating || !newName.trim() ? '#f3f4f6' : 'rgba(184,134,11,0.10)', border: `1.5px solid ${creating || !newName.trim() ? '#e5e7eb' : '#b8860b'}`, borderRadius: 9, padding: '13px 20px', color: creating || !newName.trim() ? '#9ca3af' : '#b8860b', fontSize: 14, cursor: creating || !newName.trim() ? 'not-allowed' : 'pointer', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap', fontFamily: 'inherit', fontWeight: 600 }}>
          {creating ? 'Adding…' : '+ Add'}
        </button>
      </form>

      {tours.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 0', color: '#9ca3af', fontSize: 15 }}>
          No tours yet — add one above
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {tours.map(tour => (
            <div key={tour.id} style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: 14, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 16, boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <div style={{ flex: 1, cursor: 'pointer', minWidth: 0 }} onClick={() => onSelectTour(tour)}>
                <div style={{ fontSize: 17, color: '#111827', fontWeight: 600, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {tour.name}
                </div>
                <div style={{ fontSize: 13, color: '#9ca3af' }}>
                  {tour.has_bus2 ? '2 buses · 24 premium seats' : '1 bus · 12 premium seats'}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                <span style={{ fontSize: 13, color: '#6b7280' }}>Bus 2</span>
                <div onClick={() => onToggleBus2(tour)}
                  style={{ width: 44, height: 26, borderRadius: 13, background: tour.has_bus2 ? '#b8860b' : '#e5e7eb', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'white', position: 'absolute', top: 4, left: tour.has_bus2 ? 22 : 4, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }} />
                </div>
              </div>

              <button onClick={() => onSelectTour(tour)}
                style={{ background: 'rgba(37,99,235,0.07)', border: '1px solid rgba(37,99,235,0.25)', borderRadius: 8, padding: '10px 18px', color: '#2563eb', fontSize: 13, cursor: 'pointer', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap', flexShrink: 0, fontFamily: 'inherit' }}>
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
  const [bookings, setBookings]         = useState([]);
  const [selectedSeat, setSelectedSeat] = useState(null); // { row, col, booking, busNumber }
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
    const { row, col, busNumber } = selectedSeat;
    const { error } = await supabase.from('bookings').insert({
      tour_id: selectedTour.id, bus_number: busNumber,
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
    ? bookings.find(b => b.row_number === selectedSeat.row && b.seat_letter === selectedSeat.col && b.bus_number === selectedSeat.busNumber)
    : null;

  if (appLoading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f3f4f6', color: '#9ca3af', fontSize: 14, letterSpacing: '3px', textTransform: 'uppercase', fontFamily: "'DM Mono', 'Courier New', monospace" }}>
        Loading…
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f3f4f6', color: '#111827', fontFamily: "'DM Mono', 'Courier New', monospace" }}>
      {view === 'tours' ? (
        <TourList
          tours={tours}
          onSelectTour={t => { setSelectedTour(t); setBookings([]); setView('bus'); }}
          onCreateTour={handleCreateTour}
          onToggleBus2={handleToggleBus2}
        />
      ) : (
        <BusView
          tour={selectedTour}
          bookings={bookings}
          onBack={() => { setView('tours'); setSelectedTour(null); setBookings([]); setSelectedSeat(null); }}
          onSeatClick={({ row, col, booking, busNumber }) => {
            if (row === 1 || row > 4) return;
            setSelectedSeat({ row, col, booking, busNumber });
          }}
        />
      )}
      {selectedSeat && (
        <BookingModal
          seat={selectedSeat}
          booking={selectedSeatBooking}
          onBook={handleBook}
          onCancel={handleCancelBooking}
          onClose={() => setSelectedSeat(null)}
        />
      )}
    </div>
  );
}
