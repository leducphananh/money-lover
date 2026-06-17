import { useAuth } from '@/features/auth/AuthContext';
import {
  useFamilies,
  useFamilyInvites,
  useFamilyMembers,
} from '@/features/families/useFamilies';
import {
  Check,
  Mail,
  Shield,
  User as UserIcon,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';

export default function Families() {
  const { families, createFamily, isCreating } = useFamilies();
  const { invites, respondToInvite, isResponding } = useFamilyInvites();
  const { user } = useAuth();

  const [newFamilyName, setNewFamilyName] = useState('');

  const handleCreateFamily = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFamilyName) return;
    await createFamily(newFamilyName);
    setNewFamilyName('');
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-4xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50">
          Quản lý Nhóm
        </h1>
        <p className="text-zinc-500 dark:text-zinc-400 font-medium mt-2">
          Chia sẻ sổ chi tiêu với người thân 👨‍👩‍👧‍👦
        </p>
      </div>

      {/* Invites Section */}
      {invites.length > 0 && (
        <div className="rounded-[2rem] border-2 border-amber-100 dark:border-amber-900/30 bg-amber-50/50 dark:bg-amber-950/10 p-6 md:p-8">
          <h2 className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5" /> Lời mời tham gia nhóm
          </h2>
          <div className="space-y-3">
            {invites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-amber-100 dark:border-amber-900/50"
              >
                <div>
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">
                    {/* @ts-ignore */}
                    Nhóm: {invite.families?.name}
                  </div>
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">
                    {/* @ts-ignore */}
                    Người mời: {invite.profiles?.full_name || 'Không xác định'}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      respondToInvite({
                        inviteId: invite.id,
                        status: 'rejected',
                        familyId: invite.family_id,
                      })
                    }
                    disabled={isResponding}
                    className="p-2 rounded-xl text-rose-500 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() =>
                      respondToInvite({
                        inviteId: invite.id,
                        status: 'accepted',
                        familyId: invite.family_id,
                      })
                    }
                    disabled={isResponding}
                    className="p-2 rounded-xl text-emerald-500 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/30 dark:hover:bg-emerald-900/50 transition-colors"
                  >
                    <Check className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Create Group */}
        <div className="rounded-[2rem] border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md p-6 md:p-8">
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-500" /> Tạo Nhóm Mới
          </h2>
          <form onSubmit={handleCreateFamily} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                Tên nhóm
              </label>
              <input
                type="text"
                required
                value={newFamilyName}
                onChange={(e) => setNewFamilyName(e.target.value)}
                placeholder="VD: Gia đình nhỏ, Quỹ phòng trọ..."
                className="w-full rounded-xl border-2 border-transparent bg-zinc-100 dark:bg-zinc-800/50 px-4 py-3 text-zinc-900 dark:text-zinc-100 focus:border-violet-500 focus:bg-white dark:focus:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-violet-500/20 transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={isCreating}
              className="w-full px-4 py-3 text-sm font-bold text-white bg-violet-500 hover:bg-violet-600 rounded-xl transition-colors disabled:opacity-50"
            >
              {isCreating ? 'Đang tạo...' : 'Tạo nhóm'}
            </button>
          </form>
        </div>

        {/* My Groups */}
        <div className="space-y-6">
          <h2 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            Các nhóm đã tham gia
          </h2>

          {families.length === 0 ? (
            <div className="text-zinc-500 dark:text-zinc-400 p-8 text-center bg-zinc-100 dark:bg-zinc-800/50 rounded-[2rem] font-medium">
              Bạn chưa tham gia nhóm nào.
            </div>
          ) : (
            <div className="space-y-4">
              {families.map((family) => (
                <FamilyCard key={family.id} family={family} userId={user?.id} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function FamilyCard({ family, userId }: { family: any; userId?: string }) {
  const { data: members } = useFamilyMembers(family.id);
  const {
    invites: pendingInvites,
    inviteMember,
    isInviting,
  } = useFamilyInvites(family.id);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // MOCK: Giả lập việc gửi email. Trong thực tế cần có Resend/Sendgrid & Edge Functions.
  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;
    try {
      await inviteMember({ familyId: family.id, email: inviteEmail });
      setToastMessage(
        `Đã gửi thông báo cho ${inviteEmail}! Họ có thể thấy lời mời khi đăng nhập ứng dụng.`,
      );
      setInviteEmail('');
      setIsInviteOpen(false);
      setTimeout(() => setToastMessage(null), 5000);
    } catch (err: any) {
      alert('Lỗi: ' + err.message);
    }
  };

  const isOwner = members?.find((m) => m.user_id === userId)?.role === 'owner';

  return (
    <div className="rounded-[2rem] border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-md overflow-hidden transition-all hover:shadow-md">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-extrabold text-zinc-900 dark:text-zinc-100">
            {family.name}
          </h3>
          {isOwner && (
            <button
              onClick={() => setIsInviteOpen(!isInviteOpen)}
              className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-violet-600 bg-violet-50 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-400 dark:hover:bg-violet-900/50 rounded-lg transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" /> Mời
            </button>
          )}
        </div>

        {toastMessage && (
          <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            ✅ {toastMessage}
          </div>
        )}

        {isInviteOpen && isOwner && (
          <form
            onSubmit={handleInvite}
            className="mb-4 flex gap-2 animate-in fade-in slide-in-from-top-2"
          >
            <input
              type="email"
              required
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="Nhập email..."
              className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-2 text-sm focus:border-violet-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isInviting}
              className="px-4 py-2 text-sm font-bold text-white bg-violet-500 hover:bg-violet-600 rounded-xl disabled:opacity-50"
            >
              Gửi
            </button>
          </form>
        )}

        <div className="space-y-2">
          {members?.map((m) => (
            <div
              key={m.id}
              className="flex items-center gap-3 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/50"
            >
              <div className="p-1.5 bg-zinc-200 dark:bg-zinc-700 rounded-lg">
                {m.role === 'owner' ? (
                  <Shield className="w-4 h-4 text-violet-500" />
                ) : (
                  <UserIcon className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold text-zinc-700 dark:text-zinc-200 truncate">
                  {/* @ts-ignore */}
                  {m.profiles?.full_name || 'Người dùng ẩn danh'}{' '}
                  {m.user_id === userId && '(Bạn)'}
                </div>
              </div>
              <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                {m.role}
              </div>
            </div>
          ))}

          {isOwner &&
            pendingInvites &&
            pendingInvites.map((invite) => (
              <div
                key={invite.id}
                className="flex items-center gap-3 p-2 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 opacity-70"
              >
                <div className="p-1.5 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
                  <Mail className="w-4 h-4 text-amber-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-amber-700 dark:text-amber-500 truncate">
                    {invite.email}
                  </div>
                </div>
                <div className="text-xs font-bold text-amber-500 uppercase tracking-wider">
                  ĐANG CHỜ
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
