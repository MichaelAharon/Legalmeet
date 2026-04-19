'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function useSubProjects(projectId: string) {
  return useQuery({
    queryKey: ['sub-projects', projectId],
    queryFn: async () => {
      const res = await fetch(`/api/projects/${projectId}/sub-projects`);
      if (!res.ok) throw new Error('Failed to fetch sub-projects');
      return res.json();
    },
    enabled: !!projectId,
  });
}

export function useCreateSubProject() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (data: { projectId: string; name: string; description?: string; parentSubProjectId?: string }) => {
      const res = await fetch(`/api/projects/${data.projectId}/sub-projects`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to create sub-project');
      return res.json();
    },
    onSuccess: (_, vars) => qc.invalidateQueries({ queryKey: ['sub-projects', vars.projectId] }),
  });
}
