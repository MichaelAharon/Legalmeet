export const MEETING_DELETION_ARTIFACTS = [
  'nda_signatures',
  'recordings',
  'transcripts',
  'document_bundles',
] as const;

export type MeetingDeletionArtifact = (typeof MEETING_DELETION_ARTIFACTS)[number];

type ArtifactCounts = Partial<Record<MeetingDeletionArtifact, number | null | undefined>>;

export function getMeetingDeletionBlockers(counts: ArtifactCounts): MeetingDeletionArtifact[] {
  return MEETING_DELETION_ARTIFACTS.filter((artifact) => (counts[artifact] ?? 0) > 0);
}

export function getMeetingDeletionBlockedMessage(blockers: MeetingDeletionArtifact[]): string {
  if (blockers.length === 0) return 'Meeting can be deleted';

  return 'Meeting cannot be deleted because it has legal artifacts that must be retained';
}
