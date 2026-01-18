import { useEffect, useState, useCallback } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { pb, restoreAuth } from '@/lib/pb';
import { Storage } from '@/lib/database';
import Text from '@/components/Text';
import Button from '@/components/Button';
import { Colors, Theme } from '@/constants/Colors';
import * as Icons from '@/components/icons';
import ProfileStatCard from '@/components/ProfileStatCard';
import { useRouter } from 'expo-router';

// Video Post Component
function VideoPost({
  mediaUrl,
  caption,
  colors,
}: {
  mediaUrl: string;
  caption?: string;
  colors: any;
}) {
  const player = useVideoPlayer(mediaUrl, (p: any) => {
    p.loop = true;
  });

  return (
    <>
      <VideoView
        style={styles.media}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
      />
      {caption && (
        <Text size={13} style={{ marginTop: 10, color: colors.light_grey, fontFamily: 'OpenSans-Regular' }}>
          {caption}
        </Text>
      )}
    </>
  );
}

// Follow/Unfollow helper functions
const followUser = async (followingUserId: string) => {
  const currentUserId = pb.authStore.model?.id;
  if (!currentUserId) throw new Error('Not authenticated');
  
  return await pb.collection('follows').create({
    follower: currentUserId,
    following: followingUserId,
  });
};

const unfollowUser = async (followingUserId: string) => {
  const currentUserId = pb.authStore.model?.id;
  if (!currentUserId) throw new Error('Not authenticated');
  
  const records = await pb.collection('follows').getList(1, 1, {
    filter: `follower = "${currentUserId}" && following = "${followingUserId}"`,
  });
  
  if (records.items.length > 0) {
    return await pb.collection('follows').delete(records.items[0].id);
  }
};

const checkIfFollowing = async (userId: string): Promise<boolean> => {
  const currentUserId = pb.authStore.model?.id;
  if (!currentUserId) return false;
  
  const records = await pb.collection('follows').getList(1, 1, {
    filter: `follower = "${currentUserId}" && following = "${userId}"`,
  });
  
  return records.items.length > 0;
};

const getFollowerCount = async (userId: string): Promise<number> => {
  const result = await pb.collection('follows').getList(1, 1, {
    filter: `following = "${userId}"`,
    $autoCancel: false,
  });
  
  return result.totalItems;
};

const getFollowingCount = async (userId: string): Promise<number> => {
  const result = await pb.collection('follows').getList(1, 1, {
    filter: `follower = "${userId}"`,
    $autoCancel: false,
  });
  
  return result.totalItems;
};

function ProfilePage() {
  const router = useRouter();
  const theme: Theme = 'dark';
  const colors = Colors[theme];
  const [user, setUser] = useState(pb.authStore.model);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [savedArtworks, setSavedArtworks] = useState<any[]>([]);
  const [savedLoading, setSavedLoading] = useState(false);
  const [uploadingPicture, setUploadingPicture] = useState(false);
  const [userProfile, setUserProfile] = useState<any>(user);
  const [activeTab, setActiveTab] = useState<'gallery' | 'saved'>('gallery');
  const [editBioModalVisible, setEditBioModalVisible] = useState(false);
  const [editBioText, setEditBioText] = useState('');
  const [editingBio, setEditingBio] = useState(false);
  
  // Follower stats state
  const [followerCount, setFollowerCount] = useState<number>(0);
  const [followingCount, setFollowingCount] = useState<number>(0);
  const [isFollowingUser, setIsFollowingUser] = useState<boolean>(false);
  const [followLoading, setFollowLoading] = useState(false);

  // Check if this is current user's profile
  const isCurrentUser = user?.id === userProfile?.id;

  // Authentication check and initialization
  useEffect(() => {
    const init = async () => {
      // Restore authentication state
      await restoreAuth();
      
      // Check if user is authenticated
      if (!pb.authStore.isValid || !pb.authStore.model) {
        // Also check Storage as a fallback
        try {
          const savedAuth = await Storage.getItem('pb_auth');
          if (savedAuth) {
            pb.authStore.save(savedAuth);
            if (pb.authStore.isValid && pb.authStore.model) {
              setUser(pb.authStore.model);
              await fetchMyPosts();
              await fetchUserProfile();
              await loadFollowStats();
              if (isCurrentUser) {
                await fetchSavedArtworks();
              }
              return;
            }
          }
        } catch (e) {
          console.log('No stored auth found:', e);
        }
        
        router.replace('/(auth)/Login');
        return;
      }
      
      setUser(pb.authStore.model);
      await fetchMyPosts();
      await fetchUserProfile();
      await loadFollowStats();
    };

    init();
  }, [router]);

  const fetchUserProfile = async () => {
    if (!pb.authStore.model) return;
    
    try {
      const record = await pb.collection('users').getOne(pb.authStore.model.id);
      setUserProfile(record);
    } catch (err) {
      console.error('Failed to fetch user profile:', err);
    } finally {
      setLoading(false);
    }
  };

  const showEditBioModal = () => {
    setEditBioText(userProfile?.bio || '');
    setEditBioModalVisible(true);
  };

  const handleSaveBio = async () => {
    setEditingBio(true);
    await handleEditProfile(editBioText);
    setEditingBio(false);
    setEditBioModalVisible(false);
  };

  const fetchMyPosts = async () => {
    if (!pb.authStore.model) return;
    
    try {
      const result = await pb
        .collection('posts')
        .getList(1, 50, {
          filter: `author = "${pb.authStore.model.id}"`,
          sort: '-created',
          expand: 'author',
        });
      setPosts(result.items);
    } catch (err) {
      console.error('Failed to fetch user posts:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const fetchSavedArtworks = async () => {
    if (!pb.authStore.model) return;
    
    setSavedLoading(true);
    try {
      const result = await pb
        .collection('saved_artworks')
        .getList(1, 50, {
          filter: `user = "${pb.authStore.model.id}"`,
          sort: '-created',
          expand: 'artwork,artwork.author',
        });
      
      // Extract artwork data from saved_artworks records
      const artworks = result.items.map(item => ({
        ...item.expand?.artwork,
        savedId: item.id,
      }));
      
      setSavedArtworks(artworks);
    } catch (err) {
      console.error('Failed to fetch saved artworks:', err);
    } finally {
      setSavedLoading(false);
    }
  };

  const loadFollowStats = async () => {
    if (!userProfile?.id) return;
    
    try {
      // Get follower and following counts
      const [followers, following] = await Promise.all([
        getFollowerCount(userProfile.id),
        getFollowingCount(userProfile.id),
      ]);
      
      setFollowerCount(followers);
      setFollowingCount(following);
      
      // Check if current user follows this profile (only if not current user)
      if (!isCurrentUser && user?.id) {
        const followingStatus = await checkIfFollowing(userProfile.id);
        setIsFollowingUser(followingStatus);
      }
    } catch (error) {
      console.error('Error loading follow stats:', error);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchMyPosts();
    await loadFollowStats();
    if (isCurrentUser && activeTab === 'saved') {
      await fetchSavedArtworks();
    }
    setRefreshing(false);
  }, [userProfile?.id, activeTab, isCurrentUser]);

  const handleFollow = async () => {
    if (!userProfile?.id) return;
    
    setFollowLoading(true);
    try {
      if (isFollowingUser) {
        await unfollowUser(userProfile.id);
        setFollowerCount(prev => Math.max(0, prev - 1));
      } else {
        await followUser(userProfile.id);
        setFollowerCount(prev => prev + 1);
      }
      setIsFollowingUser(!isFollowingUser);
    } catch (error) {
      console.error('Error updating follow status:', error);
      Alert.alert('Error', 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const pickAndUploadImage = async () => {
    if (!pb.authStore.model) {
      try {
        const savedAuth = await Storage.getItem('pb_auth');
        if (savedAuth) {
          pb.authStore.save(savedAuth);
          if (pb.authStore.isValid && pb.authStore.model) {
            setUser(pb.authStore.model);
          } else {
            router.replace('/(auth)/Login');
            return;
          }
        } else {
          router.replace('/(auth)/Login');
          return;
        }
      } catch (e){
        router.replace('/(auth)/Login');
        console.log(e as any);
        return;
      }
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setUploadingPicture(true);

        try {
          const imageUri = result.assets[0].uri;
          const fileName = result.assets[0].fileName || 'profile.jpg';

          const formData = new FormData();
          formData.append('profilePicture', {
            uri: imageUri,
            name: fileName,
            type: 'image/jpeg',
          } as any);

          const updated = await pb
            .collection('users')
            .update(pb.authStore.model!.id, formData);

          setUserProfile(updated);
          pb.authStore.save(pb.authStore.token, updated);
          
          await Storage.setItem('pb_auth', pb.authStore.exportToCookie());
          
          Alert.alert('Success', 'Profile picture updated!');
        } catch (error) {
          console.error('Upload error:', error);
          Alert.alert('Error', 'Failed to upload profile picture');
        }
      }
    } catch (error) {
      console.error('Image picker error:', error);
    } finally {
      setUploadingPicture(false);
    }
  };

  const getProfilePictureUrl = () => {
    if (!userProfile?.profilePicture) return null;
    return pb.files.getURL(userProfile, userProfile.profilePicture);
  };

  const handleLogout = async () => {
    pb.authStore.clear();
    await Storage.deleteItem('pb_auth');
    router.replace('/(auth)/Login');
  };

  const navigateToFollowers = () => {
    if (userProfile?.id) {
      router.push(`/(profile)/followers?userId=${userProfile.id}`);
    }
  };

  const navigateToFollowing = () => {
    if (userProfile?.id) {
      router.push(`/(profile)/following?userId=${userProfile.id}`);
    }
  };

  const handleEditProfile = async (newBio: string) => {
    if (!pb.authStore.model) return;

    try {
      const updated = await pb
        .collection('users')
        .update(pb.authStore.model.id, {
          bio: newBio,
        });

      setUserProfile(updated);
      pb.authStore.save(pb.authStore.token, updated);
      await Storage.setItem('pb_auth', pb.authStore.exportToCookie());
      
      Alert.alert('Success', 'Bio updated successfully!');
    } catch (error) {
      console.error('Error updating bio:', error);
      Alert.alert('Error', 'Failed to update bio');
    }
  };

  // Redirect if not authenticated
  if (!pb.authStore.isValid || !user) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg0 }]}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text size={16} style={{ marginTop: 12, fontFamily: 'OpenSans-Regular' }}>
          Redirecting to login...
        </Text>
      </View>
    );
  }

  // Loading state
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg0 }]}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text size={16} style={{ marginTop: 12, fontFamily: 'OpenSans-Regular' }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  const profileImageUrl = getProfilePictureUrl();
  const displayPosts = activeTab === 'gallery' ? posts : savedArtworks;
  const isLoading = activeTab === 'gallery' ? false : savedLoading;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.bg0 }]}>
      <FlatList
        data={displayPosts}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.blue}
          />
        }
        ListHeaderComponent={
          <View>
            {/* Cover / Banner Gradient */}
            <View style={styles.coverContainer}>
              <LinearGradient
                colors={[colors.blue, colors.purple, colors.orange] as const}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.cover}
              />
            </View>

            {/* Profile Section */}
            <View style={[styles.profileSection, { paddingHorizontal: 16 }]}>
              {/* Avatar - Overlapping */}
              <TouchableOpacity
                style={styles.avatarContainer}
                onPress={pickAndUploadImage}
                disabled={uploadingPicture || !isCurrentUser}
              >
                {uploadingPicture && (
                  <View
                    style={[
                      styles.uploadingOverlay,
                      { backgroundColor: 'rgba(0,0,0,0.6)' },
                    ]}
                  >
                    <ActivityIndicator size="small" color={colors.blue} />
                  </View>
                )}
                {profileImageUrl ? (
                  <Image
                    source={{ uri: profileImageUrl }}
                    style={[styles.avatar, { borderColor: colors.blue }]}
                  />
                ) : (
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: colors.bg2, borderColor: colors.blue },
                    ]}
                  >
                    <Text size={48} weight="600" style={{fontFamily:'OpenSans-Bold'}}>
                      {userProfile?.username?.charAt(0).toUpperCase() || '👤'}
                    </Text>
                  </View>
                )}
                {isCurrentUser && (
                  <View
                    style={[
                      styles.editBadge,
                      { backgroundColor: colors.blue },
                    ]}
                  >
                    <Icons.Upload size={14} color={colors.bg0} />
                  </View>
                )}
              </TouchableOpacity>

              {/* Identity Block */}
              <View style={styles.identityBlock}>
                {/* Name + Badges */}
                <View style={styles.nameRow}>
                  <Text size={28} weight="700" numberOfLines={1} style={{fontFamily:'OpenSans-Regular'}}>
                    {userProfile?.name || userProfile?.username || 'User'}
                  </Text>
                  <View
                    style={[
                      styles.verificationBadge,
                      {
                        backgroundColor: userProfile?.verified
                          ? colors.green
                          : colors.yellow,
                      },
                    ]}
                  >
                    <Text
                      size={12}
                      weight="600"
                      style={{
                        color: colors.bg0,
                        textTransform: 'uppercase',
                        letterSpacing: 0.5,
                        fontFamily: 'OpenSans-Regular',
                      }}
                    >
                      {userProfile?.verified ? '✓ Verified' : '⊘ Unverified'}
                    </Text>
                  </View>
                </View>

                {/* Username */}
                <Text
                  size={15}
                  style={{ color: colors.light_grey, marginBottom: 8, fontFamily: 'OpenSans-Regular' }}
                >
                  @{userProfile?.username}
                </Text>

                {/* Bio */}
                {userProfile?.bio && (
                  <Text
                    size={14}
                    style={{
                      color: colors.fg,
                      marginBottom: 12,
                      lineHeight: 20,
                      fontFamily: 'OpenSans-Regular',
                    }}
                  >
                    {userProfile.bio}
                  </Text>
                )}

                {/* Follow Stats */}
                <View style={styles.followStats}>
                  <TouchableOpacity 
                    style={styles.followStatItem}
                    onPress={navigateToFollowers}
                  >
                    <Text size={16} weight="700" style={{fontFamily:'OpenSans-Bold'}}>{followerCount}</Text>
                    <Text size={12} style={{ color: colors.light_grey, fontFamily: 'OpenSans-Regular' }}>
                      Followers
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={styles.followStatItem}
                    onPress={navigateToFollowing}
                  >
                    <Text size={16} weight="700" style={{fontFamily: 'OpenSans-Bold'}}>{followingCount}</Text>
                    <Text size={12} style={{ color: colors.light_grey, fontFamily: 'OpenSans-Regular' }}>
                      Following
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Action Buttons */}
                <View style={styles.actionButtons}>
                  {isCurrentUser ? (
                    <>
                      <Button
                        type="primary"
                        size="medium"
                        fullWidth
                        onPress={() => {
                          showEditBioModal();
                        }}
                        theme={theme}
                        style={{ marginBottom: 8 }}
                      >
                        Edit Profile
                      </Button>
                    </>
                  ) : (
                    <Button
                      type={isFollowingUser ? "outline" : "primary"}
                      size="medium"
                      fullWidth
                      onPress={handleFollow}
                      loading={followLoading}
                      theme={theme}
                    >
                      {isFollowingUser ? 'Following' : 'Follow'}
                    </Button>
                  )}
                </View>
              </View>

              {/* Stats Cards */}
              <View style={styles.statsRow}>
                <ProfileStatCard
                  label="Posts"
                  value={posts.length}
                  theme={theme}
                  accentColor={colors.blue}
                />

                <ProfileStatCard
                  label="Verified"
                  value={userProfile?.verifiedArtworks ?? 0}
                  theme={theme}
                  accentColor={colors.green}
                />

                <ProfileStatCard
                  label="Authenticity"
                  value={`${userProfile?.authenticity_score ?? 0}%`}
                  theme={theme}
                  accentColor={colors.yellow}
                />
              </View>

              {/* Content Tabs */}
              <View style={[styles.tabBar, { borderBottomColor: colors.grey }]}>
                <TouchableOpacity 
                  style={styles.tab}
                  onPress={() => setActiveTab('gallery')}
                >
                  <Text 
                    size={14} 
                    weight="600" 
                    style={{ color: activeTab === 'gallery' ? colors.blue : colors.light_grey, fontFamily: 'OpenSans-Regular' }}
                  >
                    Gallery
                  </Text>
                  {activeTab === 'gallery' && (
                    <View
                      style={[
                        styles.tabUnderline,
                        { backgroundColor: colors.blue },
                      ]}
                    />
                  )}
                </TouchableOpacity>

                {isCurrentUser && (
                  <TouchableOpacity 
                    style={styles.tab}
                    onPress={() => {
                      setActiveTab('saved');
                      if (savedArtworks.length === 0) {
                        fetchSavedArtworks();
                      }
                    }}
                  >
                    <Text 
                      size={14} 
                      weight="600" 
                      style={{ color: activeTab === 'saved' ? colors.blue : colors.light_grey, fontFamily: 'OpenSans-Regular' }}
                    >
                      Saved
                    </Text>
                    {activeTab === 'saved' && (
                      <View
                        style={[
                          styles.tabUnderline,
                          { backgroundColor: colors.blue },
                        ]}
                      />
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Posts Section Header */}
            {displayPosts.length > 0 && (
              <View style={styles.sectionHeader}>
                <Text size={16} weight="700" style={{ fontFamily: 'OpenSans-Regular' }}>
                  {activeTab === 'gallery' ? 'Gallery' : 'Saved'}
                </Text>
                <Text size={12} style={{ color: colors.light_grey, fontFamily: 'OpenSans-Regular' }}>
                  {displayPosts.length} items
                </Text>
              </View>
            )}
          </View>
        }
        ListEmptyComponent={
          isLoading ? null : (
            <View style={styles.emptyState}>
              <Text size={48} style={{ marginBottom: 12 }}>
                {activeTab === 'gallery' ? '📸' : '💾'}
              </Text>
              <Text size={18} weight="600" style={{ fontFamily: 'OpenSans-Regular' }}>
                {activeTab === 'gallery' ? 'No posts yet' : 'No saved artworks'}
              </Text>
              <Text
                size={14}
                style={{ marginTop: 6, color: colors.light_grey, textAlign: 'center', fontFamily: 'OpenSans-Regular' }}
              >
                {activeTab === 'gallery' ? 'Start sharing your journey with the community' : 'Save artworks to view them here'}
              </Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => {
          const mediaUrl = item.field ? pb.files.getURL(item, item.field) : null;

          return (
            <View
              style={[
                styles.post,
                { backgroundColor: colors.bg1, borderColor: colors.bg2 },
              ]}
            >
              <View style={styles.postHeader}>
                <Text
                  size={11}
                  weight="700"
                  style={{
                    color: colors.cyan,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontFamily: 'OpenSans-Regular',
                  }}
                >
                  {item.type}
                </Text>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text size={11} style={{ color: colors.light_grey, fontFamily: 'OpenSans-Regular' }}>
                    {new Date(item.created).toLocaleDateString()}
                  </Text>
                  <View
                    style={[
                      styles.postVerificationBadgeSmall,
                      {
                        backgroundColor: item.verified ? colors.green : colors.yellow,
                        marginHorizontal: 0,
                      },
                    ]}
                  >
                    <Text
                      size={9}
                      weight="600"
                      style={{
                        color: colors.bg0,
                        textTransform: 'uppercase',
                        letterSpacing: 0.2,
                        fontFamily: 'OpenSans-Regular',
                      }}
                    >
                      {item.verified ? '✓' : '⊘'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Text Posts */}
              {item.type === 'text' && (
                <Text
                  size={14}
                  style={{ marginTop: 10, lineHeight: 21, color: colors.fg, fontFamily: 'OpenSans-Regular' }}
                  numberOfLines={3}
                >
                  {item.text}
                </Text>
              )}

              {/* Image Posts */}
              {item.type === 'image' && mediaUrl && (
                <>
                  <Image
                    source={{ uri: mediaUrl }}
                    style={styles.postImage}
                    contentFit="cover"
                    transition={300}
                  />
                  {item.caption && (
                    <Text
                      size={13}
                      style={{ marginTop: 10, color: colors.light_grey, fontFamily: 'OpenSans-Regular' }}
                    >
                      {item.caption}
                    </Text>
                  )}
                  {item.verified && (
                    <View
                      style={[
                        styles.postVerificationBadgeSmall,
                        { backgroundColor: colors.green },
                      ]}
                    >
                      <Text
                        size={10}
                        weight="600"
                        style={{
                          color: colors.bg0,
                          textTransform: 'uppercase',
                          letterSpacing: 0.3,
                          fontFamily: 'OpenSans-Regular',
                        }}
                      >
                        ✓ Verified
                      </Text>
                    </View>
                  )}
                  {!item.verified && (
                    <View
                      style={[
                        styles.postVerificationBadgeSmall,
                        { backgroundColor: colors.yellow },
                      ]}
                    >
                      <Text
                        size={10}
                        weight="600"
                        style={{
                          color: colors.bg0,
                          textTransform: 'uppercase',
                          letterSpacing: 0.3,
                          fontFamily: 'OpenSans-Regular',
                        }}
                      >
                        ⊘ Unverified
                      </Text>
                    </View>
                  )}
                </>
              )}

              {/* Video Posts */}
              {item.type === 'video' && mediaUrl && (
                <VideoPost mediaUrl={mediaUrl} caption={item.caption} colors={colors} />
              )}
            </View>
          );
        }}
        scrollEventThrottle={16}
      />

      {/* Logout Button - Bottom (only for current user) */}
      {isCurrentUser && (
        <View style={[styles.logoutContainer, { borderTopColor: colors.grey }]}>
          <Button
            type="outline"
            size="medium"
            fullWidth
            onPress={handleLogout}
            theme={theme}
          >
            Logout
          </Button>
        </View>
      )}

      {/* Edit Bio Modal */}
      <Modal
        visible={editBioModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setEditBioModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.bg1 }]}>
            {/* Modal Header */}
            <View style={[styles.modalHeader, { borderBottomColor: colors.grey }]}>
              <TouchableOpacity onPress={() => setEditBioModalVisible(false)}>
                <Text size={14} style={{ color: colors.blue, fontFamily: 'OpenSans-Regular' }}>
                  Cancel
                </Text>
              </TouchableOpacity>
              <Text size={16} weight="700" style={{ color: colors.fg, fontFamily: 'OpenSans-Regular' }}>
                Edit Bio
              </Text>
              <TouchableOpacity onPress={handleSaveBio} disabled={editingBio}>
                <Text size={14} style={{ color: editingBio ? colors.light_grey : colors.blue, fontFamily: 'OpenSans-Regular' }}>
                  Save
                </Text>
              </TouchableOpacity>
            </View>

            {/* Bio Input */}
            <View style={styles.modalBody}>
              <Text size={14} weight="600" style={{ color: colors.fg, marginBottom: 8, fontFamily: 'OpenSans-Regular' }}>
                Bio
              </Text>
              <TextInput
                style={[
                  styles.bioInput,
                  {
                    color: colors.fg,
                    borderColor: colors.grey,
                    backgroundColor: colors.bg0,
                  },
                ]}
                placeholder="Add a bio..."
                placeholderTextColor={colors.light_grey}
                value={editBioText}
                onChangeText={setEditBioText}
                multiline
                maxLength={150}
                editable={!editingBio}
              />
              <Text size={11} style={{ color: colors.light_grey, marginTop: 8, fontFamily: 'OpenSans-Regular' }}>
                {editBioText.length}/150
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    fontFamily: "OpenSans-Regular"
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverContainer: {
    height: 180,
    marginBottom: -50,
  },
  cover: {
    flex: 1,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileSection: {
    zIndex: 10,
    paddingTop: 20,
  },
  avatarContainer: {
    position: 'relative',
    width: 100,
    height: 100,
    alignSelf: 'center',
    marginBottom: 16,
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#1a212e',
  },
  identityBlock: {
    marginBottom: 20,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  verificationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  followStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginVertical: 16,
    gap: 24,
  },
  followStatItem: {
    alignItems: 'center',
  },
  actionButtons: {
    marginBottom: 16,
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginHorizontal: -16,
    paddingHorizontal: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 1.5,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginTop: 16,
    marginBottom: 12,
  },
  post: {
    padding: 14,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 12,
    borderWidth: 1,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontFamily: "OpenSans-Regular"
  },
  postTypeContainer: {
    flex: 1,
  },
  postImage: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    marginTop: 10,
  },
  media: {
    width: '100%',
    height: 250,
    borderRadius: 8,
    marginTop: 10,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
    paddingHorizontal: 20,
  },
  logoutContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  statsRow: {
    flexDirection: 'row',
    marginTop: 16,
    marginBottom: 20,
    gap: 8,
  },
  postVerificationBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    marginTop: 12,
    alignSelf: 'flex-start',
  },
  postVerificationBadgeSmall: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    marginHorizontal: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  modalBody: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  bioInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    fontFamily: 'OpenSans-Regular',
    maxHeight: 150,
    textAlignVertical: 'top',
  },
});

export default ProfilePage;