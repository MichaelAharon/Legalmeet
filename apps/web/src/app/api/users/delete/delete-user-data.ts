export type MockUserDataStores = Record<string, unknown[]>;

type DbError = { message: string };

type ProfileLookupResult = {
  data: { id: string } | null;
  error: DbError | null;
};

type RpcResult = {
  error: DbError | null;
};

export type UserDeletionDb = {
  from: (table: 'profiles') => {
    select: (columns: 'id') => {
      eq: (column: 'email', value: string) => {
        maybeSingle: () => Promise<ProfileLookupResult>;
      };
    };
  };
  rpc: (fn: 'delete_user_data', args: { target_user_id: string }) => Promise<RpcResult>;
};

export type DeleteUserDataResult =
  | { success: true; profileId: string }
  | { success: false; status: number; message: string };

export function clearMockUserData(stores: MockUserDataStores) {
  for (const store of Object.values(stores)) {
    store.length = 0;
  }
}

export async function deleteSupabaseUserData(
  db: UserDeletionDb,
  email: string | null | undefined,
): Promise<DeleteUserDataResult> {
  const normalizedEmail = email?.trim();
  if (!normalizedEmail) {
    return { success: false, status: 401, message: 'Authenticated user email is required' };
  }

  const { data: profile, error: profileError } = await db
    .from('profiles')
    .select('id')
    .eq('email', normalizedEmail)
    .maybeSingle();

  if (profileError) {
    return { success: false, status: 500, message: profileError.message };
  }

  if (!profile) {
    return { success: false, status: 404, message: 'User profile not found' };
  }

  const { error: deleteError } = await db.rpc('delete_user_data', { target_user_id: profile.id });
  if (deleteError) {
    return { success: false, status: 500, message: deleteError.message };
  }

  return { success: true, profileId: profile.id };
}
