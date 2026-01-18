//app/index.tsx

import { useEffect, useState, useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Image } from 'expo-image';

import { pb, restoreAuth } from '@/lib/pb';
import Text from '@/components/Text';
import { Colors } from '@/constants/Colors';
import * as Icons from '@/components/icons';

import * as Clipboard from "expo-clipboard";

// Video Post Component
function VideoPost({ mediaUrl, caption }: { mediaUrl: string; caption?: string }) {
  const player = useVideoPlayer(mediaUrl, player => {
    player.loop = false;
    player.pause(); // Don't autoplay
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
        <Text size={14} style={{ marginTop: 10, color: '#9CA3AF' }}>
          {caption}
        </Text>
      )}
    </>
  );
}

// Post Card Component
function PostCard({ item, colors }: { item: any; colors: any }) {
  const router = useRouter();
  const mediaUrl = item.field && pb.files.getURL(item, item.field);
  const author = item.expand?.author;
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  
  // Format timestamp
  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);
    
    if (diffHours < 1) {
      const diffMins = Math.floor(diffMs / (1000 * 60));
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${Math.floor(diffHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Check if post is saved by current user
  useEffect(() => {
    const checkSavedStatus = async () => {
      const currentUser = pb.authStore.model;
      if (!currentUser) return;
      
      try {
        const savedRecord = await pb.collection('saved_artworks').getList(1, 1, {
          filter: `user = "${currentUser.id}" && artwork = "${item.id}"`,
        });
        setIsSaved(savedRecord.items.length > 0);
      } catch (error) {
        console.error('Error checking saved status:', error);
      }
    };
    
    checkSavedStatus();
  }, [item.id]);

  // Check if post is liked by current user and get counts
  useEffect(() => {
    const checkLikesAndComments = async () => {
      const currentUser = pb.authStore.model;
      
      try {
        // Get like count and check if current user liked
        if (currentUser) {
          const userLike = await pb.collection('artwork_likes').getList(1, 1, {
            filter: `user = "${currentUser.id}" && artwork = "${item.id}"`,
          });
          setIsLiked(userLike.items.length > 0);
        }
        
        // Get total like count
        const likes = await pb.collection('artwork_likes').getList(1, 1, {
          filter: `artwork = "${item.id}"`,
        });
        setLikeCount(likes.totalItems || 0);
        
        // Get comment count
        const comments = await pb.collection('artwork_comments').getList(1, 1, {
          filter: `artwork = "${item.id}"`,
        });
        setCommentCount(comments.totalItems || 0);
      } catch (error) {
        console.error('Error checking likes/comments:', error);
      }
    };
    
    checkLikesAndComments();
  }, [item.id]);

  const handleLike = async () => {
    const currentUser = pb.authStore.model;
    if (!currentUser) {
      Alert.alert('Please login', 'You need to be logged in to like posts');
      return;
    }
    
    try {
      if (isLiked) {
        // Unlike: Find and delete the like record
        const existingLikes = await pb.collection('artwork_likes').getList(1, 1, {
          filter: `user = "${currentUser.id}" && artwork = "${item.id}"`,
        });
        
        if (existingLikes.items.length > 0) {
          await pb.collection('artwork_likes').delete(existingLikes.items[0].id);
          setIsLiked(false);
          setLikeCount(prev => Math.max(0, prev - 1));
        }
      } else {
        // Like: Create new like record
        await pb.collection('artwork_likes').create({
          user: currentUser.id,
          artwork: item.id,
        });
        setIsLiked(true);
        setLikeCount(prev => prev + 1);
      }
    } catch (error: any) {
      console.error('Error toggling like:', error);
      // Handle duplicate likes error
      if (error.status === 400) {
        setIsLiked(true); // Assume it's already liked
      }
    }
  };

  const handleSave = async () => {
    const currentUser = pb.authStore.model;
    if (!currentUser) {
      Alert.alert('Please login', 'You need to be logged in to save posts');
      return;
    }
    
    try {
      if (isSaved) {
        // Unsaved logic
        const savedRecords = await pb.collection('saved_artworks').getList(1, 1, {
          filter: `user = "${currentUser.id}" && artwork = "${item.id}"`,
        });
        
        if (savedRecords.items.length > 0) {
          await pb.collection('saved_artworks').delete(savedRecords.items[0].id);
        }
        setIsSaved(false);
      } else {
        // Save logic
        await pb.collection('saved_artworks').create({
          user: currentUser.id,
          artwork: item.id,
        });
        setIsSaved(true);
      }
    } catch (error) {
      console.error('Error toggling save:', error);
    }
  };

  const handleShare = async () => {
    try {
        const shareUrl = `artint://(artwork)/${item.id}`;

        await Clipboard.setStringAsync(shareUrl);

        Alert.alert(
        'Link copied',
        'Artwork link has been copied to clipboard.'
        );
    } catch (error) {
        console.error('Error sharing:', error);
        Alert.alert('Error', 'Failed to copy link.');
    }
  };

  const handleComment = () => {
    // Navigate to comments screen
    router.push(`/(comments)/${item.id}`);
  };

  const navigateToProfile = () => {
    if (author?.id) {
      router.push(`/(profile)/${author.id}`);
    }
  };

  return (
    <View style={styles.postCard}>
      {/* Creator Header */}
      <TouchableOpacity style={styles.creatorHeader} onPress={navigateToProfile}>
        <View style={styles.creatorInfo}>
          <View style={[styles.creatorAvatar, { backgroundColor: '#A855F7' }]}>
            <Text size={16} weight="600" style={{ color: '#fff' }}>
              {author?.username?.charAt(0).toUpperCase() || 'U'}
            </Text>
          </View>
          <View>
            <Text size={14} weight="600" style={{ color: '#fff' }}>
              @{author?.username || 'unknown'}
            </Text>
            <Text size={11} style={{ color: '#9CA3AF', marginTop: 2 }}>
              {author?.name || ''}
            </Text>
          </View>
        </View>
        {author?.verified && (
          <View style={styles.verifiedBadge}>
            <Text size={10} weight="700" style={{ color: '#fff' }}>
              ✓
            </Text>
          </View>
        )}
      </TouchableOpacity>

      {/* Content Container */}
      <View style={styles.contentContainer}>
        {/* Text Post */}
        {item.type === 'text' && (
          <View style={styles.textContent}>
            <Text size={16} style={{ color: '#fff', lineHeight: 24, textAlign: 'center' }}>
              {item.text}
            </Text>
          </View>
        )}

        {/* Image Post */}
        {item.type === 'image' && mediaUrl && (
          <>
            <Image
              source={{ uri: mediaUrl }}
              style={styles.imageMedia}
              contentFit="cover"
              transition={300}
            />
            {item.caption && (
              <Text size={14} style={{ marginTop: 12, color: '#9CA3AF', paddingHorizontal: 12 }}>
                {item.caption}
              </Text>
            )}
          </>
        )}

        {/* Video Post */}
        {item.type === 'video' && mediaUrl && (
          <VideoPost mediaUrl={mediaUrl} caption={item.caption} />
        )}
      </View>

      {/* Engagement Row */}
      <View style={styles.engagementRow}>
        <TouchableOpacity style={styles.engagementButton} onPress={handleLike}>
          {/*@ts-ignore */}
          <Icons.Heart size={22} color={isLiked ? '#FF5C02' : '#9CA3AF'} fill={isLiked ? '#FF5C02' as string: 'transparent' as string} />
          <Text size={12} style={{ color: '#9CA3AF', marginLeft: 4 }}>
            {likeCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.engagementButton} onPress={handleComment}>
          <Icons.MessageCircle size={22} color="#9CA3AF" />
          <Text size={12} style={{ color: '#9CA3AF', marginLeft: 4 }}>
            {commentCount}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.engagementButton} onPress={handleShare}>
          <Icons.Share2 size={22} color="#9CA3AF" />
          <Text size={12} style={{ color: '#9CA3AF', marginLeft: 4 }}>
            Share
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.engagementButton} onPress={handleSave}>
          {/*@ts-ignore */}
          <Icons.Bookmark size={22} color={isSaved ? '#FF5C02' : '#9CA3AF'} fill={isSaved ? '#FF5C02' : 'transparent'} />
          <Text size={12} style={{ color: '#9CA3AF', marginLeft: 4 }}>
            Save
          </Text>
        </TouchableOpacity>
      </View>

      {/* Timestamp */}
      <Text size={11} style={{ color: '#6B7280', marginTop: 8, textAlign: 'right' }}>
        {formatTimestamp(item.created)}
      </Text>
    </View>
  );
}

// Creator Stories Row
function CreatorStoriesRow() {
  const router = useRouter();
  const [creators, setCreators] = useState<any[]>([]);

  useEffect(() => {
    const fetchFeaturedCreators = async () => {
      try {
        const result = await pb.collection('users').getList(1, 10, {
          filter: 'verified = true',
          sort: '-created',
        });
        setCreators(result.items);
      } catch (error) {
        console.error('Error fetching creators:', error);
      }
    };

    fetchFeaturedCreators();
  }, []);

  const navigateToCreator = (userId: string) => {
    router.push(`/(profile)/${userId}`);
  };

  if (creators.length === 0) return null;

  return (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false}
      style={styles.storiesRow}
      contentContainerStyle={styles.storiesContent}
    >
      {creators.map((creator) => (
        <TouchableOpacity
          key={creator.id}
          style={styles.storyItem}
          onPress={() => navigateToCreator(creator.id)}
        >
          <View style={styles.storyAvatarContainer}>
            <View style={[styles.storyAvatar, { backgroundColor: '#A855F7' }]}>
              <Text size={14} weight="600" style={{ color: '#fff' }}>
                {creator.username?.charAt(0).toUpperCase() || 'U'}
              </Text>
            </View>
            <View style={styles.activeIndicator} />
          </View>
          <Text size={11} style={{ color: '#9CA3AF', marginTop: 4 }} numberOfLines={1}>
            @{creator.username}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

export default function Index() {
  const router = useRouter();
  const theme = 'dark';
  const colors = Colors[theme];

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchPosts = async () => {
    try {
      const result = await pb
        .collection('posts') // Changed from 'posts' to 'artworks'
        .getList(1, 20, {
          sort: '-created',
          expand: 'author',
          filter: 'verified != false', // Only show verified or non-false posts
        });

      setPosts(result.items);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
    }
  };

  useEffect(() => {
    const init = async () => {
      // First check if already logged in
      if (pb.authStore.isValid) {
        setIsAuthenticated(true);
        await fetchPosts();
        setLoading(false);
        return;
      }

      // If not logged in, try to restore auth
      await restoreAuth();

      // Check again after restore
      if (pb.authStore.isValid) {
        setIsAuthenticated(true);
        await fetchPosts();
        setLoading(false);
        return;
      }

      // If still not authenticated, redirect to login
      router.replace('/(auth)/Login');
    };

    init();
  }, [router]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }, []);

  // Show loading while checking auth
  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: '#111827' }]}>
        <ActivityIndicator size="large" color="#A855F7" />
        <Text size={16} style={{ marginTop: 12, color: '#9CA3AF' }}>
          {isAuthenticated ? 'Loading feed...' : 'Checking authentication...'}
        </Text>
      </View>
    );
  }

  // Only show content if authenticated
  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }

  // Empty state
  if (posts.length === 0) {
    return (
      <View style={[styles.center, { backgroundColor: '#111827' }]}>
        <Text size={18} weight="600" style={{ color: '#fff' }}>
          No posts yet
        </Text>
        <Text size={14} style={{ marginTop: 8, color: '#9CA3AF' }}>
          Be the first one to post.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Top Utility Bar */}
      <View style={styles.topBar}>
        <View style={styles.topBarIcon}>
          <Icons.Bell size={24} color="#9CA3AF" />
        </View>
        <View style={styles.topBarIcon}>
          <Icons.Star size={24} color="#9CA3AF" />
        </View>
      </View>

      {/* Creator Stories Row */}
      <CreatorStoriesRow />

      {/* Feed Content */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#A855F7"
          />
        }
        contentContainerStyle={styles.feedContent}
        renderItem={({ item }) => (
          <PostCard item={item} colors={colors} />
        )}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#111827',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  topBarIcon: {
    padding: 4,
  },
  storiesRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  storiesContent: {
    paddingHorizontal: 12,
  },
  storyItem: {
    alignItems: 'center',
    marginHorizontal: 8,
    width: 64,
  },
  storyAvatarContainer: {
    position: 'relative',
  },
  storyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#111827',
  },
  activeIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10B981',
    borderWidth: 2,
    borderColor: '#111827',
  },
  feedContent: {
    paddingVertical: 12,
  },
  postCard: {
    backgroundColor: '#1F2937',
    borderRadius: 16,
    marginHorizontal: 12,
    marginBottom: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  creatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  creatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  creatorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  verifiedBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#10B981',
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentContainer: {
    marginBottom: 16,
  },
  textContent: {
    backgroundColor: '#0B0F1A',
    borderRadius: 12,
    padding: 20,
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageMedia: {
    width: '100%',
    height: 400,
    borderRadius: 12,
    backgroundColor: '#0B0F1A',
  },
  media: {
    width: '100%',
    height: 300,
    borderRadius: 12,
    backgroundColor: '#0B0F1A',
  },
  engagementRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.08)',
  },
  engagementButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 8,
  },
});