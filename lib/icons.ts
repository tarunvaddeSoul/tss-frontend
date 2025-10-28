/**
 * Centralized icon imports for tree-shaking optimization
 * This allows Next.js to automatically tree-shake unused icons
 */

// Dashboard icons
export {
  LayoutDashboard,
  Users,
  Building2,
  ClipboardCheck,
  DollarSign,
  Settings,
  Shield,
} from "lucide-react"

// Common icons
export {
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  LogOut,
  HelpCircle,
  Mail,
  Calendar,
  Search,
  Filter,
  Download,
  Upload,
  Edit,
  Trash2,
  Plus,
  X,
  Check,
} from "lucide-react"

// Status icons
export {
  TrendingUp,
  TrendingDown,
  AlertCircle,
  CheckCircle,
  XCircle,
  Info,
} from "lucide-react"

// Action icons
export {
  Eye,
  EyeOff,
  Lock,
  Unlock,
  RefreshCw,
  Loader2,
  Printer,
} from "lucide-react"

// Build a re-export helper that Next.js can optimize
import type { LucideIcon } from "lucide-react"

/**
 * Type for icon components
 */
export type Icon = LucideIcon

