import {
  Activity,
  Bell,
  CalendarDays,
  Check,
  ClipboardList,
  Clock3,
  Edit,
  Info,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  MessageCircle,
  Microscope,
  Minus,
  Pill,
  ReceiptText,
  Scale,
  Send,
  SquareActivity,
  Stethoscope,
  Trash2,
  TrendingUp,
  User,
  Users,
  X,
} from "lucide-react";

type IconProps = { className?: string };

const iconClassName = (className?: string) => className ?? "h-5 w-5";

export function HomeIcon({ className }: IconProps) {
  return (
    <LayoutDashboard className={iconClassName(className)} strokeWidth={1.75} />
  );
}

export function PillIcon({ className }: IconProps) {
  return <Pill className={iconClassName(className)} strokeWidth={1.75} />;
}

export function BellIcon({ className }: IconProps) {
  return <Bell className={iconClassName(className)} strokeWidth={1.75} />;
}

export function TrendIcon({ className }: IconProps) {
  return <TrendingUp className={iconClassName(className)} strokeWidth={1.75} />;
}

export function PulseIcon({ className }: IconProps) {
  return <Activity className={iconClassName(className)} strokeWidth={1.75} />;
}

export function ScaleIcon({ className }: IconProps) {
  return <Scale className={iconClassName(className)} strokeWidth={1.75} />;
}

export function ChatIcon({ className }: IconProps) {
  return (
    <MessageCircle className={iconClassName(className)} strokeWidth={1.75} />
  );
}

export function LogoutIcon({ className }: IconProps) {
  return <LogOut className={iconClassName(className)} strokeWidth={1.75} />;
}

export function MenuIcon({ className }: IconProps) {
  return <Menu className={iconClassName(className)} strokeWidth={1.75} />;
}

export function CloseIcon({ className }: IconProps) {
  return <X className={iconClassName(className)} strokeWidth={1.75} />;
}

export function CheckIcon({ className }: IconProps) {
  return <Check className={iconClassName(className)} strokeWidth={1.75} />;
}

export function ClockIcon({ className }: IconProps) {
  return <Clock3 className={iconClassName(className)} strokeWidth={1.75} />;
}

export function MinusIcon({ className }: IconProps) {
  return <Minus className={iconClassName(className)} strokeWidth={1.75} />;
}

export function LockIcon({ className }: IconProps) {
  return <Lock className={iconClassName(className)} strokeWidth={1.75} />;
}

export function UsersIcon({ className }: IconProps) {
  return <Users className={iconClassName(className)} strokeWidth={1.75} />;
}

export function ClipboardIcon({ className }: IconProps) {
  return (
    <ClipboardList className={iconClassName(className)} strokeWidth={1.75} />
  );
}

export function CalendarIcon({ className }: IconProps) {
  return (
    <CalendarDays className={iconClassName(className)} strokeWidth={1.75} />
  );
}

export function SendIcon({ className }: IconProps) {
  return <Send className={iconClassName(className)} strokeWidth={1.75} />;
}

export function PillBottleIcon({ className }: IconProps) {
  return <Pill className={iconClassName(className)} strokeWidth={1.75} />;
}

export function UserIcon({ className }: IconProps) {
  return <User className={iconClassName(className)} strokeWidth={1.75} />;
}

export function ResepObatIcon({ className }: IconProps) {
  return (
    <ReceiptText className={iconClassName(className)} strokeWidth={1.75} />
  );
}

export function PemeriksaanKlinisIcon({ className }: IconProps) {
  return (
    <Stethoscope className={iconClassName(className)} strokeWidth={1.75} />
  );
}

export function PemeriksaanLabIcon({ className }: IconProps) {
  return <Microscope className={iconClassName(className)} strokeWidth={1.75} />;
}

export function DiagnosisIcon({ className }: IconProps) {
  return (
    <SquareActivity className={iconClassName(className)} strokeWidth={1.75} />
  );
}

export function DetailIcon({ className }: IconProps) {
  return <Info className={iconClassName(className)} strokeWidth={1.75} />;
}

export function EditIcon({ className }: IconProps) {
  return <Edit className={iconClassName(className)} strokeWidth={1.75} />;
}

export function DeleteIcon({ className }: IconProps) {
  return <Trash2 className={iconClassName(className)} strokeWidth={1.75} />;
}
