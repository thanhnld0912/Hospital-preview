import React, { useEffect, useId } from 'react';

// Bộ component giao diện dùng chung cho khu vực quản trị (tông xanh lá của code-hospital)

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'bg-[#1c7a42] hover:bg-[#155f33] text-white border-transparent shadow-xs',
  secondary: 'bg-white hover:bg-[#eef6f0] text-[#1c7a42] border-[#a6d3b4]',
  danger: 'bg-[#bb0112] hover:bg-[#a0010f] text-white border-transparent shadow-xs',
  ghost: 'bg-transparent hover:bg-gray-100 text-[#414755] border-transparent',
};

interface AdminButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: 'sm' | 'md';
  icon?: string;
  loading?: boolean;
  loadingText?: string;
}

export const AdminButton: React.FC<AdminButtonProps> = ({
  variant = 'primary',
  size = 'md',
  icon,
  loading = false,
  loadingText = 'Đang lưu...',
  disabled,
  className = '',
  children,
  type = 'button',
  ...props
}) => (
  <button
    {...props}
    type={type}
    disabled={disabled || loading}
    className={`inline-flex items-center justify-center gap-1.5 rounded-lg border font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1c7a42]/40 ${
      size === 'sm' ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'
    } ${buttonVariants[variant]} ${className}`}
  >
    {loading ? (
      <span className="material-symbols-outlined text-base animate-spin">progress_activity</span>
    ) : (
      icon && <span className="material-symbols-outlined text-base">{icon}</span>
    )}
    <span>{loading ? loadingText : children}</span>
  </button>
);

// ---------------------------------------------------------------------------
// Form fields
// ---------------------------------------------------------------------------
const controlClass =
  'w-full rounded-lg border bg-white px-3 py-2 text-sm text-[#121c2a] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1c7a42]/30 focus:border-[#1c7a42] disabled:bg-gray-50';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
}

function FieldWrapper({
  id,
  label,
  hint,
  error,
  required,
  className = '',
  children,
}: FieldProps & { id: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-xs font-semibold text-[#121c2a] mb-1">
        {label} {required && <span className="text-[#bb0112]">*</span>}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-xs text-[#bb0112]">{error}</p>
      ) : (
        hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>
      )}
    </div>
  );
}

type InputProps = FieldProps & Omit<React.InputHTMLAttributes<HTMLInputElement>, 'className'>;

export const AdminInput: React.FC<InputProps> = ({ label, hint, error, required, className, ...props }) => {
  const id = useId();
  return (
    <FieldWrapper id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <input
        id={id}
        required={required}
        aria-invalid={!!error}
        className={`${controlClass} ${error ? 'border-[#bb0112]' : 'border-gray-300'}`}
        {...props}
      />
    </FieldWrapper>
  );
};

type TextareaProps = FieldProps & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>;

export const AdminTextarea: React.FC<TextareaProps> = ({ label, hint, error, required, className, rows = 3, ...props }) => {
  const id = useId();
  return (
    <FieldWrapper id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <textarea
        id={id}
        rows={rows}
        required={required}
        aria-invalid={!!error}
        className={`${controlClass} ${error ? 'border-[#bb0112]' : 'border-gray-300'}`}
        {...props}
      />
    </FieldWrapper>
  );
};

type SelectProps = FieldProps &
  Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'className'> & {
    options: { value: string; label: string }[];
  };

export const AdminSelect: React.FC<SelectProps> = ({ label, hint, error, required, className, options, ...props }) => {
  const id = useId();
  return (
    <FieldWrapper id={id} label={label} hint={hint} error={error} required={required} className={className}>
      <select
        id={id}
        required={required}
        className={`${controlClass} ${error ? 'border-[#bb0112]' : 'border-gray-300'}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </FieldWrapper>
  );
};

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  hint?: string;
}

export const AdminCheckbox: React.FC<CheckboxProps> = ({ label, checked, onChange, hint }) => (
  <label className="flex items-start gap-2 cursor-pointer select-none">
    <input
      type="checkbox"
      checked={checked}
      onChange={(event) => onChange(event.target.checked)}
      className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-[#1c7a42]"
    />
    <span>
      <span className="block text-sm font-medium text-[#121c2a]">{label}</span>
      {hint && <span className="block text-xs text-gray-500">{hint}</span>}
    </span>
  </label>
);

// ---------------------------------------------------------------------------
// States
// ---------------------------------------------------------------------------
export const LoadingState: React.FC<{ message?: string }> = ({ message = 'Đang tải dữ liệu...' }) => (
  <div className="flex items-center justify-center gap-2 py-12 text-sm text-[#414755]" role="status">
    <span className="material-symbols-outlined text-[#1c7a42] animate-spin">progress_activity</span>
    <span>{message}</span>
  </div>
);

export const EmptyState: React.FC<{ message: string; action?: React.ReactNode; icon?: string }> = ({
  message,
  action,
  icon = 'inbox',
}) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
    <span className="material-symbols-outlined text-4xl text-[#a6d3b4]">{icon}</span>
    <p className="text-sm text-[#414755]">{message}</p>
    {action}
  </div>
);

export const ErrorState: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-12 text-center" role="alert">
    <span className="material-symbols-outlined text-4xl text-[#bb0112]">error</span>
    <p className="text-sm text-[#121c2a] max-w-md">{message}</p>
    {onRetry && (
      <AdminButton variant="secondary" size="sm" icon="refresh" onClick={onRetry}>
        Thử lại
      </AdminButton>
    )}
  </div>
);

export interface NoticeMessage {
  type: 'success' | 'error';
  text: string;
}

/** Thông báo inline; thông báo thành công tự ẩn sau 4 giây */
export const Notice: React.FC<{ notice: NoticeMessage | null; onClose: () => void }> = ({ notice, onClose }) => {
  useEffect(() => {
    if (notice?.type !== 'success') return;
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [notice, onClose]);

  if (!notice) return null;
  const isSuccess = notice.type === 'success';
  return (
    <div
      role={isSuccess ? 'status' : 'alert'}
      className={`mb-4 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
        isSuccess ? 'bg-[#eef6f0] border-[#a6d3b4] text-[#155f33]' : 'bg-red-50 border-red-200 text-red-900'
      }`}
    >
      <span className="material-symbols-outlined text-base mt-0.5">{isSuccess ? 'check_circle' : 'error'}</span>
      <span className="flex-1">{notice.text}</span>
      <button type="button" onClick={onClose} className="opacity-70 hover:opacity-100" aria-label="Đóng thông báo">
        <span className="material-symbols-outlined text-base">close</span>
      </button>
    </div>
  );
};

export const StatusBadge: React.FC<{ tone: 'green' | 'gray' | 'amber' | 'red'; children: React.ReactNode }> = ({
  tone,
  children,
}) => {
  const tones = {
    green: 'bg-[#d4ecdb] text-[#155f33]',
    gray: 'bg-gray-100 text-gray-600',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-700',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold whitespace-nowrap ${tones[tone]}`}>
      {children}
    </span>
  );
};

// ---------------------------------------------------------------------------
// Page header + table
// ---------------------------------------------------------------------------
export const PageHeader: React.FC<{ title: string; description?: string; actions?: React.ReactNode }> = ({
  title,
  description,
  actions,
}) => (
  <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 className="text-xl sm:text-2xl font-bold text-[#121c2a]">{title}</h1>
      {description && <p className="mt-0.5 text-sm text-[#414755]">{description}</p>}
    </div>
    {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
  </div>
);

export const Card: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`rounded-xl border border-gray-200 bg-white shadow-xs ${className}`}>{children}</div>
);

/** Bảng có cuộn ngang riêng trong khung (không làm tràn cả trang trên mobile) */
export const AdminTable: React.FC<{ headers: string[]; children: React.ReactNode }> = ({ headers, children }) => (
  <div className="overflow-x-auto">
    <table className="w-full min-w-[640px] text-sm">
      <thead>
        <tr className="border-b border-gray-200 bg-[#f7faf8] text-left text-xs uppercase tracking-wide text-[#414755]">
          {headers.map((header) => (
            <th key={header} scope="col" className="px-4 py-3 font-semibold whitespace-nowrap">
              {header}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100">{children}</tbody>
    </table>
  </div>
);

// ---------------------------------------------------------------------------
// Modal + confirm dialog
// ---------------------------------------------------------------------------
interface AdminModalProps {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  /** Chặn đóng khi đang gửi dữ liệu */
  locked?: boolean;
}

export const AdminModal: React.FC<AdminModalProps> = ({ title, onClose, children, footer, size = 'md', locked = false }) => {
  const titleId = useId();

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !locked) onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      window.removeEventListener('keydown', handleKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [onClose, locked]);

  const widths = { sm: 'max-w-md', md: 'max-w-2xl', lg: 'max-w-4xl' };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 p-0 sm:p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`flex max-h-[95vh] sm:max-h-[90vh] w-full ${widths[size]} flex-col rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl`}
      >
        <div className="flex items-center justify-between gap-3 border-b border-gray-200 px-5 py-4">
          <h2 id={titleId} className="text-base font-bold text-[#121c2a]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            disabled={locked}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-500 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Đóng"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-4">{children}</div>
        {footer && (
          <div className="flex flex-wrap justify-end gap-2 border-t border-gray-200 bg-gray-50 px-5 py-3 rounded-b-2xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

interface ConfirmDialogProps {
  message?: string;
  detail?: string;
  confirmLabel?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  message = 'Bạn có chắc chắn muốn xóa nội dung này không?',
  detail,
  confirmLabel = 'Xóa',
  loading = false,
  onConfirm,
  onCancel,
}) => (
  <AdminModal
    title="Xác nhận"
    size="sm"
    onClose={onCancel}
    locked={loading}
    footer={
      <>
        <AdminButton variant="ghost" onClick={onCancel} disabled={loading}>
          Hủy
        </AdminButton>
        <AdminButton variant="danger" icon="delete" onClick={onConfirm} loading={loading} loadingText="Đang xóa...">
          {confirmLabel}
        </AdminButton>
      </>
    }
  >
    <p className="text-sm text-[#121c2a]">{message}</p>
    {detail && <p className="mt-2 text-sm font-semibold text-[#414755]">{detail}</p>}
  </AdminModal>
);
