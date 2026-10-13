import {
  Activity,
  Award,
  Calendar,
  FileText,
  FolderOpen,
  Images,
  LayoutDashboard,
  Lightbulb,
  Mail,
  Map,
  Megaphone,
  Milestone,
  Newspaper,
  Quote,
  Settings,
  UserCog,
  Users,
  Video,
  type LucideIcon,
} from "lucide-react";

const icons: Record<string, LucideIcon> = {
  award: Award,
  lightbulb: Lightbulb,
  newspaper: Newspaper,
  images: Images,
  "file-text": FileText,
  calendar: Calendar,
  video: Video,
  milestone: Milestone,
  quote: Quote,
  map: Map,
  megaphone: Megaphone,
  mail: Mail,
  users: Users,
  dashboard: LayoutDashboard,
  settings: Settings,
  media: FolderOpen,
  team: UserCog,
  activity: Activity,
};

export function Icon({ name, className }: { name: string; className?: string }) {
  const C = icons[name] ?? FileText;
  return <C className={className} strokeWidth={1.75} />;
}
