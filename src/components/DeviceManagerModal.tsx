import React, { useState } from 'react';
import { X, Smartphone, Trash2, ShieldCheck, AlertCircle } from 'lucide-react';
import { License } from '../types';

interface DeviceManagerModalProps {
  license: License | null;
  isOpen: boolean;
  onClose: () => void;
  onUnbindDevice: (licenseId: string, deviceId: string) => Promise<any>;
}

export const DeviceManagerModal: React.FC<DeviceManagerModalProps> = ({
  license,
  isOpen,
  onClose,
  onUnbindDevice
}) => {
  if (!isOpen || !license) return null;

  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const handleUnbind = async (deviceId: string) => {
    if (!confirm('Deseja realmente desvincular este dispositivo? O usuário precisará reativar.')) {
      return;
    }
    setIsDeleting(deviceId);
    try {
      await onUnbindDevice(license.id, deviceId);
    } catch (err: any) {
      alert(err.message || 'Erro ao desvincular dispositivo');
    } finally {
      setIsDeleting(null);
    }
  };

  const devices = license.devices || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 pb-3">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="font-bold text-sm text-slate-900">
                Dispositivos Vinculados à Licença
              </h3>
              <p className="text-[11px] text-slate-500 font-mono">{license.key}</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-slate-600 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
          <span>
            Dispositivos em uso:{' '}
            <strong className="text-slate-900">
              {devices.length} de {license.maxDevices || 1} slots
            </strong>
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5" /> Validação por Hardware DID
          </span>
        </div>

        <div className="space-y-2.5 max-h-72 overflow-y-auto">
          {devices.length === 0 ? (
            <div className="p-8 text-center text-slate-400 text-xs">
              Nenhum dispositivo ativado nesta licença ainda.
            </div>
          ) : (
            devices.map((dev, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl border border-slate-200 bg-white shadow-xs flex items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="font-bold text-slate-900 flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {dev.deviceName}
                    <span className="text-[10px] font-mono font-semibold px-1.5 py-0.2 bg-slate-100 rounded text-slate-600">
                      v{dev.extVersion}
                    </span>
                  </div>
                  <code className="text-[10px] text-slate-400 font-mono block mt-0.5 truncate max-w-xs">
                    DID: {dev.deviceId}
                  </code>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Ativado em: {new Date(dev.activatedAt).toLocaleDateString('pt-BR')} • IP:{' '}
                    {dev.ip || '127.0.0.1'}
                  </div>
                </div>

                <button
                  onClick={() => handleUnbind(dev.deviceId)}
                  disabled={isDeleting === dev.deviceId}
                  title="Liberar slot de dispositivo"
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg border border-slate-200 transition shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="flex justify-end pt-2 border-t border-slate-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-xs"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
