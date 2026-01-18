import { useEffect, useState, useCallback } from 'react';
import {
  View,
  ActivityIndicator,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';

import { pb } from '@/lib/pb';
import Text from '@/components/Text';
import { Colors } from '@/constants/Colors';
import * as Icons from '@/components/icons';

// ============================================================================
// VERIFICATION BADGE — Derived from PocketBase fields
// ============================================================================
function VerificationBadge({ post }: { post: any }) {
  // UI State Machine (SPEC section 9)
  let label = '';
  let icon = '';
  let colors: [string, string] = ['#6366f1', '#8b5cf6'];

  if (!post.ai_checked) {
    // Scanning state: AI analysis not yet complete
    icon = '⏳';
    label = 'Scanning…';
    colors = ['#f59e0b', '#f97316'];
  } else if (post.verified) {
    // Verified state: Approved by human
    icon = '✓';
    label = 'Verified';
    colors = ['#10b981', '#14b8a6'];
  } else {
    // Pending Review state: AI done, awaiting human decision
    icon = '⚠️';
    label = 'Pending Review';
    colors = ['#ef4444', '#dc2626'];
  }

  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.badge}
    >
      <Text size={10} weight="700" style={styles.badgeText}>
        {icon} {label}
      </Text>
    </LinearGradient>
  );
}

// ============================================================================
// POST CARD — Displays posts with verification state
// ============================================================================
function PostCard({ item, onRefresh }: { item: any; onRefresh: () => void }) {
  const mediaUrl = item.field && pb.files.getURL(item, item.field);
  const postDate = new Date(item.created).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });

  const player = item.type === 'video' && mediaUrl
    // eslint-disable-next-line react-hooks/rules-of-hooks
    ? useVideoPlayer(mediaUrl, p => {
        p.loop = false;
      })
    : null;

  // Fire-and-forget AI trigger
  // Only trigger if: ai_checked != true AND ai_score == null
  useEffect(() => {
    const shouldTrigger = !item.ai_checked && item.ai_score === null;
    
    if (shouldTrigger && item.type === 'image') {
      triggerAIAnalysis(item.id);
    }
  }, [item.id, item.ai_checked, item.ai_score]);

  const triggerAIAnalysis = async (postId: string) => {
    try {
      // Fire-and-forget request to middleman
      // No response handling, no UI blocking
      fetch(`${process.env.EXPO_PUBLIC_MIDDLEMAN_URL}/process/${postId}`, {
        method: 'POST',
      }).catch(() => {
        // Silently ignore if middleman unavailable
        // UI continues to function normally
      });
    } catch (error) {
      // Silently ignore errors
      // Verify page remains decoupled from AI availability
    }
  };

  return (
    <TouchableOpacity activeOpacity={0.7} style={styles.card}>
      {/* Left: Media Preview */}
      <View style={styles.mediaContainer}>
        {item.type === 'image' && mediaUrl ? (
          <Image
            source={{ uri: mediaUrl }}
            style={styles.media}
            contentFit="cover"
          />
        ) : item.type === 'video' && mediaUrl && player ? (
          <VideoView
            style={styles.media}
            player={player}
            allowsFullscreen={false}
            nativeControls={false}
          />
        ) : item.type === 'text' ? (
          <View style={styles.textPlaceholder}>
            <Text size={24} style={{ color: '#64748b' }}>
              📝
            </Text>
          </View>
        ) : null}
        
        {/* Media Type Badge */}
        <View style={styles.typeOverlay}>
          <Text size={9} weight="700" style={{ color: '#ffffff', fontFamily: 'OpenSans-Regular' }}>
            {item.type.toUpperCase()}
          </Text>
        </View>
      </View>

      {/* Right: Details */}
      <View style={styles.detailsContainer}>
        {/* Verification Badge (from PocketBase) */}
        <View style={styles.detailsHeader}>
          <VerificationBadge post={item} />
        </View>

        {/* Content Preview */}
        {item.type === 'text' ? (
          <Text 
            size={13} 
            style={styles.textPreview}
            numberOfLines={2}
          >
            {item.text}
          </Text>
        ) : (
          <Text 
            size={13} 
            style={styles.captionPreview}
            numberOfLines={2}
          >
            {item.caption || 'No caption'}
          </Text>
        )}

        {/* Date + AI Score (if available) */}
        <View style={styles.metaRow}>
          <Text size={11} style={styles.date} numberOfLines={1}>
            {postDate}
          </Text>
          {item.ai_score !== null && item.ai_score !== undefined && (
            <Text size={10} style={styles.aiScoreLabel}>
              AI: {Math.round(item.ai_score)}%
            </Text>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

// ============================================================================
// VERIFY SCREEN
// ============================================================================
function VerifyScreen() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [posts, setPosts] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);

  // ============================================================================
  // DATA FETCHING — Always from PocketBase (source of truth)
  // ============================================================================
  const fetchUserPosts = async () => {
    try {
      const userId = pb.authStore.model?.id;
      
      if (!userId) {
        console.error('No user logged in');
        return;
      }

      // Fetch from PocketBase
      const result = await pb
        .collection('posts')
        .getList(1, 50, {
          filter: `author = "${userId}"`,
          sort: '-created',
        });

      setPosts(result.items);
      setFilteredPosts(result.items);
    } catch (err) {
      console.error('Failed to fetch user posts:', err);
    }
  };

  // ============================================================================
  // LIFECYCLE
  // ============================================================================
  useEffect(() => {
    const init = async () => {
      await fetchUserPosts();
      setLoading(false);

      // Optional: Subscribe to realtime updates from PocketBase
      // This allows immediate UI refresh when admin verifies posts
      const userId = pb.authStore.model?.id;
      if (userId) {
        pb.collection('posts').subscribe('*', () => {
          // Realtime update triggered
          fetchUserPosts();
        }, {
          filter: `author = "${userId}"`,
        });
      }
    };

    init();

    return () => {
      // Cleanup subscriptions
      pb.collection('posts').unsubscribe();
    };
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchUserPosts();
    setRefreshing(false);
  }, []);

  // ============================================================================
  // SEARCH
  // ============================================================================
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (!query.trim()) {
      setFilteredPosts(posts);
      return;
    }

    const filtered = posts.filter(post => {
      const searchLower = query.toLowerCase();
      
      if (post.type === 'text' && post.text?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      if (post.caption?.toLowerCase().includes(searchLower)) {
        return true;
      }
      
      return false;
    });

    setFilteredPosts(filtered);
  }, [posts]);

  // ============================================================================
  // RENDERING
  // ============================================================================
  if (loading) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: '#0a0e1a' }]}>
        <ActivityIndicator size="large" color="#14b8a6" />
        <Text size={15} style={[styles.loadingText, { fontFamily: 'OpenSans-Regular' }]}>
          Loading your submissions...
        </Text>
      </View>
    );
  }

  if (posts.length === 0) {
    return (
      <View style={[styles.centerContainer, { backgroundColor: '#0a0e1a' }]}>
        <Text size={20} weight="600" style={[styles.emptyTitle, { fontFamily: 'OpenSans-Regular' }]}>
          No posts yet
        </Text>
        <Text size={14} style={[styles.emptySubtitle, { fontFamily: 'OpenSans-Regular' }]}>
          Create your first post to see it here
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.screenHeader}>
        <Text size={24} weight="700" style={[styles.headerTitle, { fontFamily: 'OpenSans-Regular' }]}>
          Verification Dashboard
        </Text>
        <Text size={13} style={[styles.headerSubtitle, { fontFamily: 'OpenSans-Regular' }]}>
          Your submissions and authenticity status
        </Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Icons.Search size={18} color="#64748b" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts..."
            placeholderTextColor="#64748b"
            value={searchQuery}
            onChangeText={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => handleSearch('')}>
              <Text size={16} style={{ color: '#64748b' }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Posts List */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#14b8a6"
          />
        }
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => <PostCard item={item} onRefresh={onRefresh} />}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          searchQuery.length > 0 ? (
            <View style={styles.noResultsContainer}>
              <Text size={16} style={{ color: '#64748b', fontFamily: 'OpenSans-Regular' }}>
                No posts match &quot;{searchQuery}&quot;
              </Text>
            </View>
          ) : null
        }
      />
    </View>
  );
}

// ============================================================================
// STYLES
// ============================================================================
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0e1a',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  screenHeader: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  headerTitle: {
    color: '#f1f5f9',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#94a3b8',
    opacity: 0.8,
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111827',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#e2e8f0',
    fontFamily: 'OpenSans-Regular',
    marginHorizontal: 8,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  card: {
    backgroundColor: '#111827',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    height: 140,
  },
  mediaContainer: {
    width: 140,
    height: 140,
    position: 'relative',
    backgroundColor: '#1e293b',
  },
  media: {
    width: '100%',
    height: '100%',
  },
  textPlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1e293b',
  },
  typeOverlay: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  detailsContainer: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  detailsHeader: {
    marginBottom: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  badgeText: {
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  textPreview: {
    color: '#e2e8f0',
    lineHeight: 18,
    marginBottom: 6,
    fontFamily: 'OpenSans-Regular',
  },
  captionPreview: {
    color: '#cbd5e1',
    lineHeight: 18,
    marginBottom: 6,
    fontFamily: 'OpenSans-Regular',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  date: {
    color: '#64748b',
    opacity: 0.7,
    fontFamily: 'OpenSans-Regular',
  },
  aiScoreLabel: {
    color: '#f59e0b',
    fontFamily: 'OpenSans-Regular',
    fontWeight: '600',
  },
  loadingText: {
    color: '#94a3b8',
    marginTop: 16,
  },
  emptyTitle: {
    color: '#f1f5f9',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#94a3b8',
    opacity: 0.8,
    textAlign: 'center',
  },
  noResultsContainer: {
    paddingVertical: 40,
    alignItems: 'center',
  },
});

export default VerifyScreen;