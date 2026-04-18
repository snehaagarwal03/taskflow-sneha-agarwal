import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, FolderKanban, ChevronLeft, ChevronRight } from 'lucide-react';

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { projects, isLoading, fetchProjects } = useProjects();
  const navigate = useNavigate();
  const params = useParams();
  const activeProjectId = params.id;

  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleProjectClick = (projectId: string) => {
    navigate(`/projects/${projectId}`);
    onClose(); // close mobile sheet
  };

  const handleCreateProject = () => {
    // Dispatch a custom event that ProjectsPage listens for
    window.dispatchEvent(new CustomEvent('open-create-project'));
    onClose();
  };

  const projectList = (
    <div className="flex flex-col gap-1 px-2">
      {isLoading ? (
        <>
          <Skeleton className="h-8 w-full" />
          <Skeleton className="h-8 w-full" />
        </>
      ) : (
        projects.map((project) => (
          <button
            key={project.id}
            onClick={() => handleProjectClick(project.id)}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground ${
              activeProjectId === project.id
                ? 'bg-accent text-accent-foreground font-medium'
                : 'text-muted-foreground'
            }`}
          >
            <FolderKanban className="h-4 w-4 shrink-0" />
            <span className="truncate">{project.name}</span>
          </button>
        ))
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className={`hidden lg:flex flex-col border-r bg-background transition-all ${
          collapsed ? 'w-14' : 'w-60'
        }`}
      >
        <div className="flex items-center justify-between p-3 border-b">
          {!collapsed && (
            <span className="text-sm font-medium text-muted-foreground">Projects</span>
          )}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCollapsed(!collapsed)}
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>

        {!collapsed && projectList}

        {!collapsed && (
          <div className="mt-auto p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={handleCreateProject}
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        )}
      </aside>

      {/* Mobile sidebar (Sheet) */}
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          <SheetHeader className="p-4 border-b">
            <SheetTitle className="text-left">Projects</SheetTitle>
          </SheetHeader>
          <div className="flex-1 overflow-auto py-2">
            {projectList}
          </div>
          <div className="p-2 border-t">
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2"
              onClick={handleCreateProject}
            >
              <Plus className="h-4 w-4" />
              New Project
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
