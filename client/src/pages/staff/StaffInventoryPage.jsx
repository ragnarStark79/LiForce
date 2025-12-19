import { useState, useEffect, useMemo } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { staffService } from '../../services/staffService';
import { BLOOD_GROUPS } from '../../utils/constants';
import toast from 'react-hot-toast';

const StaffInventoryPage = () => {
  const [loading, setLoading] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [formData, setFormData] = useState({
    bloodGroup: 'A+',
    units: 1,
    action: 'ADD',
  });

  // UI-only controls
  const [query, setQuery] = useState('');
  const [stockFilter, setStockFilter] = useState(''); // '', 'CRITICAL', 'LOW', 'HEALTHY'

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const data = await staffService.getInventory();
      setInventory(data.inventory || []);
    } catch (error) {
      console.error('Failed to fetch inventory:', error);
      toast.error('Failed to load inventory data');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStock = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const updateData = {
        bloodGroup: formData.bloodGroup,
        operation: formData.action === 'ADD' ? 'add' : 'subtract',
        units: formData.units,
      };
      await staffService.updateInventory(updateData);
      toast.success('Stock updated!');
      setShowUpdateModal(false);
      setFormData({ bloodGroup: 'A+', units: 1, action: 'ADD' });
      fetchInventoryData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update');
    } finally {
      setFormLoading(false);
    }
  };

  const getInventoryForBloodGroup = (bloodGroup) => {
    const item = inventory.find((i) => i.bloodGroup === bloodGroup);
    return item?.unitsAvailable || 0;
  };

  const kpis = useMemo(() => {
    const totalUnits = inventory.reduce((sum, item) => sum + (item.unitsAvailable || 0), 0);
    const lowStockCount = inventory.filter((i) => (i.unitsAvailable || 0) > 0 && (i.unitsAvailable || 0) < 5).length;
    const healthyCount = inventory.filter(i => (i.unitsAvailable || 0) >= 10).length;
    const criticalCount = inventory.filter(i => (i.unitsAvailable || 0) === 0).length;
    return { totalUnits, lowStockCount, healthyCount, criticalCount };
  }, [inventory]);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();

    return BLOOD_GROUPS.filter((bg) => {
      const units = getInventoryForBloodGroup(bg);
      const isCritical = units === 0;
      const isLow = units > 0 && units < 5;
      const isHealthy = units >= 10;

      const qOk = !q || bg.toLowerCase().includes(q);
      const fOk =
        !stockFilter ||
        (stockFilter === 'CRITICAL' && isCritical) ||
        (stockFilter === 'LOW' && isLow) ||
        (stockFilter === 'HEALTHY' && isHealthy);

      return qOk && fOk;
    });
  }, [query, stockFilter, inventory]);

  const Shell = ({ children }) => (
    <div className="mx-auto max-w-7xl">
      {children}
    </div>
  );

  const GlassCard = ({ className = '', children }) => (
    <section className={`staffdash-card ${className}`}>{children}</section>
  );

  const SkeletonLine = ({ w = 'w-full' }) => (
    <div className={`h-3 ${w} rounded-full staffdash-skeleton`} />
  );

  if (loading) {
    return (
      <Shell>
        <div className="space-y-4">
          <GlassCard className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-3">
                <SkeletonLine w="w-40" />
                <SkeletonLine w="w-72" />
              </div>
              <div className="h-10 w-32 rounded-xl staffdash-skeleton" />
            </div>

            <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="rounded-2xl border border-white/50 bg-white/55 backdrop-blur-xl p-5 ring-1 ring-black/5">
                  <SkeletonLine w="w-20" />
                  <div className="mt-3 h-8 w-16 rounded-xl staffdash-skeleton" />
                  <div className="mt-3">
                    <SkeletonLine w="w-24" />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard className="p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="h-11 rounded-2xl staffdash-skeleton" />
              <div className="h-11 rounded-2xl staffdash-skeleton" />
              <div className="h-11 rounded-2xl staffdash-skeleton" />
            </div>
          </GlassCard>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
            {Array.from({ length: 16 }).map((_, i) => (
              <div key={i} className="aspect-square rounded-2xl staffdash-skeleton" />
            ))}
          </div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="space-y-4">
        {/* Header */}
        <GlassCard className="p-6 sm:p-7 overflow-hidden">
          <div className="relative">
            <div className="absolute -top-28 -right-24 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />
            <div className="absolute -bottom-28 -left-24 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />

            <div className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 rounded-2xl border border-white/40 bg-white/55 px-3 py-1 text-xs font-semibold text-slate-600 backdrop-blur-md">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Blood Inventory
                </div>
                <h1 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900">
                  Stock Console
                </h1>
                <p className="mt-2 text-sm font-medium text-slate-500 max-w-2xl">
                  Monitor availability by group and update units in real time.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={fetchInventoryData}
                  className="rounded-xl border border-slate-900/10 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md hover:bg-white transition-all"
                >
                  Refresh
                </button>
                <button
                  onClick={() => setShowUpdateModal(true)}
                  className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-semibold text-white hover:bg-slate-800 transition-all"
                >
                  + Update Stock
                </button>
              </div>
            </div>

            {/* KPI tiles */}
            <div className="relative mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                { label: 'Total Units', value: kpis.totalUnits, tone: 'text-slate-900' },
                { label: 'Low Stock', value: kpis.lowStockCount, tone: 'text-amber-700' },
                { label: 'Healthy', value: kpis.healthyCount, tone: 'text-emerald-700' },
                { label: 'Critical (0)', value: kpis.criticalCount, tone: 'text-rose-700' }
              ].map((s) => (
                <div key={s.label} className="rounded-2xl border border-white/50 bg-white/55 backdrop-blur-xl p-5 ring-1 ring-black/5 shadow-[0_14px_50px_-26px_rgba(15,23,42,0.35)]">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">{s.label}</div>
                  <div className={`mt-2 text-3xl font-semibold tabular-nums ${s.tone}`}>{s.value}</div>
                  <div className="mt-3 h-px w-full bg-linear-to-r from-slate-900/0 via-slate-900/10 to-slate-900/0" />
                  <div className="mt-3 text-xs font-semibold text-slate-500">Snapshot</div>
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* Filters */}
        <GlassCard className="p-4 sm:p-5">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            <div className="md:col-span-5">
              <Input
                label=""
                placeholder="Search blood group (e.g. A+, O-)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="md:col-span-4">
              <Select
                label=""
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
                options={[
                  { value: '', label: 'All stock levels' },
                  { value: 'CRITICAL', label: 'Critical (0)' },
                  { value: 'LOW', label: 'Low (<5)' },
                  { value: 'HEALTHY', label: 'Healthy (>=10)' }
                ]}
                className="w-full"
              />
            </div>
            <div className="md:col-span-3 flex gap-2 justify-end">
              <button
                onClick={() => { setQuery(''); setStockFilter(''); }}
                className="w-full md:w-auto rounded-xl border border-slate-900/10 bg-white/70 px-3 py-2 text-xs font-semibold text-slate-700 backdrop-blur-md hover:bg-white transition-all"
              >
                Clear
              </button>
            </div>
          </div>
        </GlassCard>

        {/* Grid */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="text-sm font-semibold text-slate-900">Unit Distribution</div>
            <div className="text-xs font-semibold text-slate-500">{filteredGroups.length} group(s)</div>
          </div>

          <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3 md:gap-4">
            {filteredGroups.map((bloodGroup) => {
              const units = getInventoryForBloodGroup(bloodGroup);
              const isCritical = units === 0;
              const isLow = units > 0 && units < 5;
              const isHealthy = units >= 10;

              const frame = isCritical
                ? 'border-rose-200 bg-rose-50/70'
                : 'border-white/50 bg-white/55';

              const valueTone = isCritical
                ? 'text-rose-600'
                : isLow
                  ? 'text-amber-700'
                  : isHealthy
                    ? 'text-emerald-700'
                    : 'text-slate-900';

              return (
                <button
                  type="button"
                  key={bloodGroup}
                  onClick={() => {
                    setFormData({ ...formData, bloodGroup });
                    setShowUpdateModal(true);
                  }}
                  className={`relative aspect-square rounded-2xl border ${frame} backdrop-blur-xl p-3 md:p-4 shadow-[0_14px_50px_-26px_rgba(15,23,42,0.35)] ring-1 ring-black/5 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white/70`}
                  title="Click to update"
                >
                  {isCritical && <div className="absolute inset-0 rounded-2xl bg-rose-500/5 staffdash-pulse" />}
                  {isLow && (
                    <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(250,204,21,0.6)]" />
                  )}

                  <div className="relative flex h-full flex-col items-center justify-center">
                    <div className={`text-3xl md:text-4xl font-semibold tabular-nums tracking-tight ${valueTone}`}>
                      {units}
                    </div>
                    <div className="mt-2 inline-flex items-center justify-center rounded-xl border border-black/5 bg-white/60 px-2.5 py-1 text-sm font-semibold text-slate-700">
                      {bloodGroup}
                    </div>
                    <div className="mt-2 text-[10px] font-semibold text-slate-500">
                      {isCritical ? 'CRITICAL' : isLow ? 'LOW' : isHealthy ? 'HEALTHY' : 'OK'}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredGroups.length === 0 && (
            <GlassCard className="mt-4 p-10 text-center">
              <div className="text-sm font-semibold text-slate-900">No groups match your filters</div>
              <div className="mt-1 text-xs font-semibold text-slate-500">Clear filters and try again.</div>
            </GlassCard>
          )}
        </div>

        {/* Update Modal */}
        <Modal isOpen={showUpdateModal} onClose={() => setShowUpdateModal(false)} title="Update Stock">
          <form onSubmit={handleUpdateStock} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Group"
                value={formData.bloodGroup}
                onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                options={BLOOD_GROUPS.map(bg => ({ value: bg, label: bg }))}
              />
              <Input
                label="Units"
                type="number"
                min="1"
                value={formData.units}
                onChange={(e) => setFormData({ ...formData, units: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
            <Select
              label="Action"
              value={formData.action}
              onChange={(e) => setFormData({ ...formData, action: e.target.value })}
              options={[{ value: 'ADD', label: 'Add Stock' }, { value: 'REMOVE', label: 'Remove Stock' }]}
            />

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="secondary" onClick={() => setShowUpdateModal(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" disabled={formLoading}>
                {formLoading ? <LoadingSpinner size="sm" /> : null}
                Confirm Update
              </Button>
            </div>
          </form>
        </Modal>
      </div>
    </Shell>
  );
};

export default StaffInventoryPage;
