import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, ExternalLink, Calendar, BadgeCheck, Edit2, X, Check, Camera, ImagePlus, Lock } from 'lucide-react';
import { useAppStore } from '../store/useAppStore';
import { formatCount, readImageFileAsDataUrl } from '../lib/utils';
import Avatar from './Avatar';
import Button from './Button';
import type { EditProfileData, User } from '../types';

interface ProfileHeaderProps {
  user: User;
  isCurrentUser?: boolean;
}

const inputClass =
  'w-full bg-tbank-gray border border-tbank-border rounded-xl px-3 py-2 text-sm text-tbank-black outline-none' +
  ' focus:border-brand focus:shadow-[0_0_0_3px_rgba(255,221,45,0.25)]' +
  ' dark:bg-white/[0.07] dark:border-white/[0.12] dark:text-white dark:focus:border-brand/60 transition-all';

export default function ProfileHeader({ user, isCurrentUser = false }: ProfileHeaderProps) {
  const { followedUserIds, toggleFollow, updateProfile, isEditingProfile, setEditingProfile, isSavingProfile } = useAppStore();
  const isFollowing = followedUserIds.has(user.id);
  const canShowProfileDetails = isCurrentUser || user.publicProfile !== false;

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  const [mediaError, setMediaError] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const { register, handleSubmit, reset, setValue, watch } = useForm<EditProfileData>({
    defaultValues: {
      displayName: user.displayName,
      bio: user.bio,
      location: user.location ?? '',
      website: user.website ?? '',
      avatar: user.avatar,
      banner: user.banner ?? '',
    },
  });
  const editData = watch();

  const openEdit = () => {
    setMediaError(null);
    setAvatarFile(null);
    reset({
      displayName: user.displayName,
      bio: user.bio,
      location: user.location ?? '',
      website: user.website ?? '',
      avatar: user.avatar,
      banner: user.banner ?? '',
    });
    setEditingProfile(true);
  };

  const cancelEdit = () => {
    setMediaError(null);
    setAvatarFile(null);
    setEditingProfile(false);
  };

  const handleAvatarFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setMediaError(null);
      const dataUrl = await readImageFileAsDataUrl(file);
      setAvatarFile(file);
      setValue('avatar', dataUrl, { shouldDirty: true });
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : 'Could not load image');
    }
  };

  const handleBannerFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      setMediaError(null);
      const dataUrl = await readImageFileAsDataUrl(file);
      setValue('banner', dataUrl, { shouldDirty: true });
    } catch (err) {
      setMediaError(err instanceof Error ? err.message : 'Could not load image');
    }
  };

  const bannerPreview =
    isCurrentUser && isEditingProfile ? editData.banner?.trim() || undefined : user.banner;
  const avatarPreview =
    isCurrentUser && isEditingProfile ? editData.avatar : user.avatar;

  const onSubmit = async (data: EditProfileData) => {
    await updateProfile(
      {
        ...data,
        avatar: data.avatar?.trim() || user.avatar,
      },
      avatarFile,
    );
  };

  return (
    <div className="rounded-3xl border border-tbank-border bg-white shadow-card overflow-hidden dark:border-white/[0.08] dark:bg-white/[0.04] dark:shadow-none">
      {/* Banner */}
      <div className="relative h-40 overflow-hidden group/banner">
        {bannerPreview ? (
          <img src={bannerPreview} alt="Banner" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand via-brand-light to-brand-dark opacity-90" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-white/60 to-transparent dark:from-[#111214]/70 dark:to-transparent" />

        {isCurrentUser && isEditingProfile && (
          <>
            <input
              ref={bannerInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleBannerFile}
            />
            <button
              type="button"
              onClick={() => bannerInputRef.current?.click()}
              className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 bg-tbank-black/40 opacity-0 group-hover/banner:opacity-100 transition-opacity text-white text-sm font-medium"
            >
              <ImagePlus size={22} />
              Change cover
            </button>
            <button
              type="button"
              onClick={() => setValue('banner', '', { shouldDirty: true })}
              className="absolute top-2 right-2 px-2 py-1 rounded-lg text-xs font-medium bg-white/90 text-tbank-black shadow-sm hover:bg-white dark:bg-[#111214]/90 dark:text-white"
            >
              Reset to gradient
            </button>
          </>
        )}
      </div>

      <div className="px-6 pb-6">
        <div className="flex items-end justify-between -mt-12 mb-4">
          <div className="relative">
            <Avatar src={avatarPreview} alt={user.displayName} size="2xl" className="ring-4 ring-white dark:ring-[#111214]" />
            {user.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-brand rounded-full p-0.5">
                <BadgeCheck size={16} className="text-tbank-black" />
              </div>
            )}

            {isCurrentUser && isEditingProfile && (
              <>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarFile}
                />
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute inset-0 rounded-full flex items-center justify-center bg-tbank-black/45 opacity-0 hover:opacity-100 transition-opacity"
                  aria-label="Change avatar"
                >
                  <Camera size={28} className="text-white" />
                </button>
              </>
            )}
          </div>

          {isCurrentUser ? (
            <div className="flex gap-2">
              {isEditingProfile ? (
                <>
                  <Button variant="ghost" size="sm" icon={<X size={14} />} onClick={cancelEdit}>
                    Cancel
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={<Check size={14} />}
                    type="submit"
                    form="profile-edit-form"
                    disabled={isSavingProfile}
                  >
                    {isSavingProfile ? 'Saving...' : 'Save'}
                  </Button>
                </>
              ) : (
                <Button variant="secondary" size="sm" icon={<Edit2 size={14} />} onClick={openEdit}>
                  Edit Profile
                </Button>
              )}
            </div>
          ) : (
            <Button variant={isFollowing ? 'secondary' : 'primary'} size="md" onClick={() => toggleFollow(user.id)}>
              {isFollowing ? 'Following' : 'Follow'}
            </Button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {isEditingProfile && isCurrentUser ? (
            <motion.form
              id="profile-edit-form"
              key="edit"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3 mb-4"
              onSubmit={(event) => void handleSubmit(onSubmit)(event)}
            >
              {mediaError && (
                <p className="text-sm text-rose-600 dark:text-rose-400">{mediaError}</p>
              )}

              {/* Optional: paste image URLs (e.g. Unsplash). Same fields would be filled by API after real upload. */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  value={editData.avatar.startsWith('data:') ? '' : editData.avatar}
                  onChange={(e) => setValue('avatar', e.target.value, { shouldDirty: true })}
                  placeholder="Avatar image URL (optional)"
                  className={inputClass}
                />
                <input
                  value={editData.banner?.startsWith('data:') ? '' : editData.banner}
                  onChange={(e) => setValue('banner', e.target.value, { shouldDirty: true })}
                  placeholder="Cover image URL (optional)"
                  className={inputClass}
                />
              </div>
              <p className="text-xs text-stone-500 dark:text-white/35">
                Upload photos by clicking the avatar or cover, or paste a direct image link.{' '}
              </p>

              <input
                className={`${inputClass} text-lg font-bold font-display`}
                {...register('displayName', { required: true, minLength: 2 })}
              />
              <textarea
                rows={3}
                className={`${inputClass} resize-none`}
                {...register('bio')}
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  placeholder="Location"
                  className={inputClass}
                  {...register('location')}
                />
                <input
                  placeholder="Website URL"
                  className={inputClass}
                  {...register('website')}
                />
              </div>
            </motion.form>
          ) : (
            <motion.div key="view" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div className="flex items-center gap-2 mb-0.5">
                <h1 className="text-xl font-bold text-tbank-black dark:text-white font-display">{user.displayName}</h1>
                {user.isVerified && <BadgeCheck size={18} className="text-brand" />}
              </div>
              <p className="text-sm text-stone-500 dark:text-white/40 mb-3">@{user.username}</p>
              {canShowProfileDetails ? (
                <>
                  <p className="text-sm text-stone-700 dark:text-white/70 leading-relaxed mb-4">{user.bio}</p>
                  <div className="flex flex-wrap gap-4 text-xs text-stone-500 dark:text-white/40 mb-4">
                    {user.location && (
                      <span className="flex items-center gap-1">
                        <MapPin size={12} />
                        {user.location}
                      </span>
                    )}
                    {user.website && (
                      <a
                        href={user.website}
                        className="flex items-center gap-1 text-stone-700 hover:text-tbank-black dark:text-brand/70 dark:hover:text-brand transition-colors"
                      >
                        <ExternalLink size={12} />
                        {user.website.replace('https://', '')}
                      </a>
                    )}
                    <span className="flex items-center gap-1">
                      <Calendar size={12} />
                      Joined {new Date(user.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </>
              ) : (
                <div className="mb-4 flex items-center gap-2 rounded-2xl border border-tbank-border bg-tbank-gray px-4 py-3 text-sm text-stone-600 dark:border-white/[0.08] dark:bg-white/[0.05] dark:text-white/55">
                  <Lock size={16} className="text-brand" />
                  This profile is private.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {canShowProfileDetails ? (
          <div className="flex gap-6 pt-4 border-t border-tbank-border/70 dark:border-white/[0.07] text-sm">
            <div>
              <span className="font-semibold text-tbank-black dark:text-white">{formatCount(user.postsCount)}</span>{' '}
              <span className="text-stone-500 dark:text-white/40">posts</span>
            </div>
            <div>
              <span className="font-semibold text-tbank-black dark:text-white">{formatCount(user.followersCount)}</span>{' '}
              <span className="text-stone-500 dark:text-white/40">followers</span>
            </div>
            <div>
              <span className="font-semibold text-tbank-black dark:text-white">{formatCount(user.followingCount)}</span>{' '}
              <span className="text-stone-500 dark:text-white/40">following</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
