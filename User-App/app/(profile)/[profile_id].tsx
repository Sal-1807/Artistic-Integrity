// app/(profile)/[profile_id].tsx
import { useEffect, useState } from 'react';
import { 
  View, 
  ActivityIndicator, 
  StyleSheet, 
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { pb } from '@/lib/pb';
import Text from '@/components/Text';
import Button from '@/components/Button';
import { Colors, Theme } from '@/constants/Colors';


export default function UserProfilePage() {
  const router = useRouter();
  const { profile_id } = useLocalSearchParams<{ profile_id: string }>();
  const theme: Theme = 'dark';
  const colors = Colors[theme];
  
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [userPosts, setUserPosts] = useState<any[]>([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const currentUserId = pb.authStore.model?.id;

  // Check if this is current user's profile
  const isCurrentUser = currentUserId === profile_id;

  useEffect(() => {
    fetchUserData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile_id]);

  const fetchUserData = async () => {
    try {
      // Fetch user profile
      const user = await pb.collection('users').getOne(profile_id);
      setUserData(user);

      // Fetch user posts
      const posts = await pb.collection('posts').getList(1, 20, {
        filter: `author = "${profile_id}"`,
        sort: '-created',
        expand: 'author',
      });
      setUserPosts(posts.items);

      // Check follow status (if logged in)
      if (currentUserId && !isCurrentUser) {
        // You'll need to implement your own follow logic
        // Example: check if current user follows this profile
        const followCheck = await pb.collection('follows').getList(1, 1, {
          filter: `follower = "${currentUserId}" && following = "${profile_id}"`,
        });
        setIsFollowing(followCheck.items.length > 0);
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      Alert.alert('Error', 'User not found');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!currentUserId) {
      router.push('/(auth)/Login');
      return;
    }

    try {
      if (isFollowing) {
        // Unfollow logic
        await pb.collection('follows').delete(profile_id/* follow record id */);
      } else {
        // Follow logic
        await pb.collection('follows').create({
          follower: currentUserId,
          following: profile_id,
        });
      }
      setIsFollowing(!isFollowing);
    } catch (error) {
      console.error('Error updating follow status:', error);
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg0 }]}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text size={16} style={{ marginTop: 12 }}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!userData) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg0 }]}>
        <Text size={18}>User not found</Text>
        <Button
          onPress={() => router.back()}
          style={{ marginTop: 20 }}
          theme={theme}
        >
          Go Back
        </Button>
      </View>
    );
  }

  const profilePictureUrl = userData.profilePicture 
    ? pb.files.getURL(userData, userData.profilePicture)
    : null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg0 }]}>
      {/* Cover Image/Gradient */}
      <View style={styles.coverContainer}>
        <LinearGradient
          colors={[colors.blue, colors.purple, colors.orange] as const}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.cover}
        />
      </View>

      {/* Profile Header */}
      <View style={styles.profileHeader}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          {profilePictureUrl ? (
            <Image
              source={{ uri: profilePictureUrl }}
              style={[styles.avatar, { borderColor: colors.blue }]}
            />
          ) : (
            <View style={[styles.avatar, { backgroundColor: colors.bg2 }]}>
              <Text size={48} weight="600">
                {userData.username?.charAt(0).toUpperCase() || '👤'}
              </Text>
            </View>
          )}
        </View>

        {/* User Info */}
        <View style={styles.userInfo}>
          <Text size={28} weight="700">
            {userData.name || userData.username}
          </Text>
          <Text size={15} style={{ color: colors.light_grey }}>
            @{userData.username}
          </Text>
          
          {userData.bio && (
            <Text size={14} style={{ marginTop: 8, color: colors.fg }}>
              {userData.bio}
            </Text>
          )}

          {/* Stats */}
          <View style={styles.stats}>
            <View style={styles.statItem}>
              <Text size={16} weight="700">{userPosts.length}</Text>
              <Text size={12} style={{ color: colors.light_grey }}>Posts</Text>
            </View>
            <View style={styles.statItem}>
              <Text size={16} weight="700">{userData.followers || 0}</Text>
              <Text size={12} style={{ color: colors.light_grey }}>Followers</Text>
            </View>
            <View style={styles.statItem}>
              <Text size={16} weight="700">{userData.following || 0}</Text>
              <Text size={12} style={{ color: colors.light_grey }}>Following</Text>
            </View>
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          {isCurrentUser ? (
            <Button
              type="outline"
              size="medium"
              onPress={() => router.push('/(profile)/edit')}
              theme={theme}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                type={isFollowing ? "outline" : "primary"}
                size="medium"
                onPress={handleFollow}
                theme={theme}
              >
                {isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button
                type="outline"
                size="medium"
                onPress={() => {/* Message logic */}}
                theme={theme}
                style={{ marginLeft: 8 }}
              >
                Message
              </Button>
            </>
          )}
        </View>
      </View>

      {/* Posts Section */}
      <View style={styles.postsSection}>
        <Text size={18} weight="600" style={{ marginBottom: 16 }}>
          Posts ({userPosts.length})
        </Text>
        
        {userPosts.length === 0 ? (
          <View style={styles.emptyPosts}>
            <Text size={16} style={{ color: colors.light_grey }}>
              No posts yet
            </Text>
          </View>
        ) : (
          userPosts.map((post) => (
            <PostPreview key={post.id} post={post} colors={colors} />
          ))
        )}
      </View>
    </ScrollView>
  );
}

// Post Preview Component
function PostPreview({ post, colors }: { post: any; colors: any }) {
  const mediaUrl = post.field ? pb.files.getURL(post, post.field) : null;
  
  return (
    <TouchableOpacity 
      style={[styles.postCard, { backgroundColor: colors.bg1 }]}
      onPress={() => {/* Navigate to post */}}
    >
      {post.type === 'text' ? (
        <Text numberOfLines={3} style={{ color: colors.fg }}>
          {post.text}
        </Text>
      ) : mediaUrl ? (
        <Image
          source={{ uri: mediaUrl }}
          style={styles.postImage}
          contentFit="cover"
        />
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverContainer: {
    height: 150,
  },
  cover: {
    flex: 1,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  profileHeader: {
    paddingHorizontal: 16,
    marginTop: -40,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    alignItems: 'center',
    marginTop: 16,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  postsSection: {
    padding: 16,
    marginTop: 20,
  },
  emptyPosts: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  postCard: {
    borderRadius: 8,
    marginBottom: 12,
    padding: 12,
    minHeight: 80,
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
});