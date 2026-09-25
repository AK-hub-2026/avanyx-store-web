import React, { useState, useEffect } from 'react';
import {
  CreditCard,
  QrCode,
  Upload,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Save,
  Eye,
  Tag,
  ShieldCheck,
  ToggleLeft,
  ToggleRight,
  ExternalLink,
  Layers,
  Copy,
  Check
} from 'lucide-react';
import {
  fetchPaymentSettings,
  subscribeToPaymentSettings,
  adminUpdatePaymentSetting,
  fetchCouponCodes
} from '../../services/firestoreService';
import { PaymentSetting, PaymentType, CouponCode } from '../../types';

interface AdminPaymentConsoleProps {
  adminUid: string;
}

export const AdminPaymentConsole: React.FC<AdminPaymentConsoleProps> = ({ adminUid }) => {
  const [settings, setSettings] = useState<PaymentSetting[]>([]);
  const [coupons, setCoupons] = useState<CouponCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<PaymentType>('DEVELOPER_VERIFICATION');
  const [editForm, setEditForm] = useState<Partial<PaymentSetting>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [copiedUpi, setCopiedUpi] = useState(false);

  useEffect(() => {
    const unsub = subscribeToPaymentSettings((data) => {
      setSettings(data);
      setLoading(false);
    });

    fetchCouponCodes().then(setCoupons);

    return () => unsub();
  }, []);

  const currentSetting = settings.find((s) => s.paymentType === selectedType);

  useEffect(() => {
    if (currentSetting) {
      setEditForm({
        amount: currentSetting.amount,
        upiId: currentSetting.upiId,
        accountName: currentSetting.accountName,
        qrImageUrl: currentSetting.qrImageUrl,
        enabled: currentSetting.enabled,
        title: currentSetting.title,
        description: currentSetting.description
      });
      setSaveSuccess(null);
      setSaveError(null);
    }
  }, [currentSetting, selectedType]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSetting) return;

    setIsSaving(true);
    setSaveSuccess(null);
    setSaveError(null);

    try {
      await adminUpdatePaymentSetting(
        selectedType,
        {
          amount: Number(editForm.amount) || currentSetting.amount,
          upiId: (editForm.upiId || currentSetting.upiId).trim(),
          accountName: (editForm.accountName || currentSetting.accountName).trim(),
          qrImageUrl: (editForm.qrImageUrl || '').trim(),
          enabled: editForm.enabled ?? currentSetting.enabled,
          title: editForm.title || currentSetting.title,
          description: editForm.description || currentSetting.description
        },
        adminUid
      );

      setSaveSuccess(`Successfully updated payment configuration for ${currentSetting.title}! Changes are live instantly.`);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to update payment setting');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyUpi = () => {
    if (!editForm.upiId) return;
    navigator.clipboard.writeText(editForm.upiId);
    setCopiedUpi(true);
    setTimeout(() => setCopiedUpi(false), 2000);
  };

  // Preview QR generator URL
  const previewQrUrl =
    editForm.qrImageUrl && editForm.qrImageUrl.trim().length > 5
      ? editForm.qrImageUrl
      : `https://api.qrserver.com/v1/create-qr-code/?size=250x250&margin=8&data=${encodeURIComponent(
          `upi://pay?pa=${encodeURIComponent(editForm.upiId || 'avanyx@upi')}&pn=${encodeURIComponent(
            editForm.accountName || 'AVANYX'
          )}&am=${editForm.amount || 0}&cu=INR&tn=${encodeURIComponent(selectedType)}`
        )}`;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 shadow-sm space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-xl font-black text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#6750A4] dark:text-[#D0BCFF]" />
              <span>AVANYX Payment Console</span>
            </h2>
            <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
              Centrally manage real UPI QR codes, UPI IDs, account details, and fee amounts across all store payment flows. All updates reflect dynamically on live payment screens without requiring an app release.
            </p>
          </div>
          <span className="self-start sm:self-center px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold flex items-center gap-1.5 shrink-0">
            <ShieldCheck className="w-4 h-4" />
            <span>Live Firestore Sync</span>
          </span>
        </div>
      </div>

      {/* Main Grid: Payment Types List & Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Payment Types Selector */}
        <div className="lg:col-span-4 space-y-3">
          <div className="text-xs font-bold text-[#49454F] dark:text-[#CAC4D0] uppercase tracking-wider px-2">
            Payment Types ({settings.length})
          </div>

          <div className="space-y-2">
            {loading ? (
              <div className="p-8 text-center text-xs text-zinc-500 flex items-center justify-center gap-2">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Loading payment settings...</span>
              </div>
            ) : (
              settings.map((item) => {
                const isSelected = item.paymentType === selectedType;
                return (
                  <button
                    key={item.id}
                    onClick={() => setSelectedType(item.paymentType)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start justify-between gap-3 ${
                      isSelected
                        ? 'bg-[#6750A4]/10 dark:bg-[#6750A4]/20 border-[#6750A4] shadow-sm'
                        : 'bg-white dark:bg-[#1E1F23] border-black/5 dark:border-white/5 hover:border-black/20 dark:hover:border-white/20'
                    }`}
                  >
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-[#1D1B20] dark:text-[#E6E1E5] truncate">
                          {item.title}
                        </span>
                        {!item.enabled && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-bold">
                            Disabled
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#49454F] dark:text-[#CAC4D0] line-clamp-1">
                        {item.description}
                      </p>
                      <div className="text-xs font-mono font-bold text-[#6750A4] dark:text-[#D0BCFF] pt-1">
                        Amount: ₹{item.amount}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <span className="inline-flex px-2 py-1 rounded-xl bg-black/5 dark:bg-white/5 text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
                        {item.upiId}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Active Coupons Summary Card */}
          <div className="p-4 rounded-2xl bg-purple-500/5 border border-purple-500/20 space-y-2 mt-4">
            <div className="flex items-center justify-between text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5]">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-[#6750A4]" /> Active Developer Coupons
              </span>
              <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300">
                {coupons.length} Active
              </span>
            </div>
            <p className="text-[11px] text-[#49454F] dark:text-[#CAC4D0]">
              Max ₹200 discount. Valid until 31 Dec 2027. One use per developer.
            </p>
            <div className="space-y-1.5 pt-1">
              {coupons.map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-[#121316] text-[11px] font-mono border border-black/5 dark:border-white/5"
                >
                  <span className="font-bold text-[#6750A4] dark:text-[#D0BCFF]">{c.code}</span>
                  <span className="text-emerald-600 font-bold">-₹{c.discountAmount} (Used: {c.usedCount || 0})</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Configuration & QR Preview Editor */}
        <div className="lg:col-span-8 space-y-6">
          {currentSetting ? (
            <form onSubmit={handleSave} className="space-y-6">
              <div className="p-6 rounded-3xl bg-white dark:bg-[#1E1F23] border border-black/5 dark:border-white/5 shadow-sm space-y-6">
                {/* Form Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-black/5 dark:border-white/5 pb-4">
                  <div>
                    <h3 className="text-base font-extrabold text-[#1D1B20] dark:text-[#E6E1E5]">
                      {currentSetting.title} Configuration
                    </h3>
                    <p className="text-xs text-[#49454F] dark:text-[#CAC4D0]">
                      Key: <code className="font-mono text-purple-600">{currentSetting.paymentType}</code>
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5]">
                      <span>{editForm.enabled ? 'Enabled' : 'Disabled'}</span>
                      <button
                        type="button"
                        onClick={() => setEditForm((prev) => ({ ...prev, enabled: !prev.enabled }))}
                        className={`text-2xl transition-colors ${
                          editForm.enabled ? 'text-emerald-500' : 'text-zinc-400'
                        }`}
                      >
                        {editForm.enabled ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                      </button>
                    </label>
                  </div>
                </div>

                {saveSuccess && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>{saveSuccess}</span>
                  </div>
                )}

                {saveError && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{saveError}</span>
                  </div>
                )}

                {/* Form Fields & QR Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Inputs */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5]">
                        Payment Amount (₹) <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={editForm.amount ?? currentSetting.amount}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, amount: Number(e.target.value) }))
                        }
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] border border-black/5 dark:border-white/5 text-xs font-mono font-bold text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5]">
                        UPI VPA ID <span className="text-rose-500">*</span>
                      </label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          required
                          value={editForm.upiId ?? currentSetting.upiId}
                          onChange={(e) =>
                            setEditForm((prev) => ({ ...prev, upiId: e.target.value }))
                          }
                          placeholder="e.g. avanyx@upi"
                          className="flex-1 px-4 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] border border-black/5 dark:border-white/5 text-xs font-mono font-bold text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                        />
                        <button
                          type="button"
                          onClick={handleCopyUpi}
                          className="px-3 py-2 rounded-2xl bg-black/5 dark:bg-white/5 hover:bg-black/10 text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5] flex items-center gap-1"
                        >
                          {copiedUpi ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5]">
                        Account Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        value={editForm.accountName ?? currentSetting.accountName}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, accountName: e.target.value }))
                        }
                        placeholder="e.g. AVANYX STORE INDIA"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] border border-black/5 dark:border-white/5 text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#1D1B20] dark:text-[#E6E1E5]">
                        Custom QR Image URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={editForm.qrImageUrl ?? currentSetting.qrImageUrl}
                        onChange={(e) =>
                          setEditForm((prev) => ({ ...prev, qrImageUrl: e.target.value }))
                        }
                        placeholder="https://... or leave empty for auto-generated QR"
                        className="w-full px-4 py-2.5 rounded-2xl bg-[#F3EDF7] dark:bg-[#25262B] border border-black/5 dark:border-white/5 text-xs font-mono text-[#1D1B20] dark:text-[#E6E1E5] focus:outline-none focus:ring-2 focus:ring-[#6750A4]"
                      />
                      <p className="text-[10px] text-zinc-500">
                        If left blank, a dynamic UPI QR code pointing to <code>{editForm.upiId || 'avanyx@upi'}</code> for ₹{editForm.amount || 0} is generated automatically.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: QR Code Live Preview */}
                  <div className="flex flex-col items-center justify-center p-6 rounded-3xl bg-[#F3EDF7] dark:bg-[#25262B] border border-black/5 dark:border-white/5 space-y-3 text-center">
                    <span className="text-[11px] font-bold text-[#49454F] dark:text-[#CAC4D0] uppercase tracking-wider">
                      Live QR Code Preview
                    </span>

                    <div className="p-3 rounded-2xl bg-white shadow-md border border-purple-500/20">
                      <img
                        src={previewQrUrl}
                        alt="QR Preview"
                        className="w-44 h-44 object-contain rounded-xl"
                      />
                    </div>

                    <div className="space-y-0.5 text-xs">
                      <span className="font-bold text-[#1D1B20] dark:text-[#E6E1E5]">
                        Pay ₹{editForm.amount ?? currentSetting.amount}
                      </span>
                      <p className="text-[11px] font-mono text-purple-700 dark:text-purple-300">
                        {editForm.upiId || currentSetting.upiId}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Submit Action */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-3 rounded-2xl bg-[#6750A4] hover:bg-[#523e85] text-white font-extrabold text-xs shadow-md transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {isSaving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Saving Changes...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save & Publish Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <div className="p-12 text-center text-xs text-zinc-500">
              Select a payment type from the left to configure.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
