import { NavLink } from "@/components/NavLink";
import { manualSections } from "../data/manualContent";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";

interface ManualSidebarProps {
  onLinkClick?: () => void; // Para fechar a sidebar em mobile
}

export function ManualSidebar({ onLinkClick }: ManualSidebarProps) {
  return (
    <Card className="h-full overflow-y-auto p-4">
      <h2 className="text-lg font-semibold mb-4">Tópicos do Manual</h2>
      <nav className="space-y-2">
        {manualSections.map((section) => (
          <div key={section.id} className="space-y-1">
            <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-1">
              <section.icon className="h-4 w-4" />
              {section.title}
            </h3>
            <ul className="ml-4 space-y-1 border-l pl-4">
              {section.topics.map((topic) => (
                <li key={topic.id}>
                  <NavLink
                    to={`/manual/${topic.path}`}
                    className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                    activeClassName="text-primary font-medium"
                    onClick={onLinkClick}
                  >
                    {topic.title}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </Card>
  );
}