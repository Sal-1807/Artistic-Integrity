import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  SectionList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  ScrollView,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { pb } from '@/lib/pb';
import Text from '@/components/Text';
import { Colors, Theme } from '@/constants/Colors';
import * as Icons from '@/components/icons';

type SearchMode = 'global' | 'users_only' | 'hashtag';

interface UserResult {
  id: string;
  username: string;
  name: string;
  profilePicture?: string;
  verified: boolean;
}

interface PostResult {
  id: string;
  type: 'text' | 'image' | 'video';
  text?: string;
  caption: string;
  field?: string;
  author: string;
}

interface SearchSection {
  title: string;
  data: (UserResult | PostResult)[];
  type: 'users' | 'posts';
}

interface TrendingHashtag {
  id: string;
  tag: string;
  count: number;
}

interface CreatorCard {
  id: string;
  name: string;
  username: string;
  profilePicture?: string;
  verified: boolean;
}

interface ArtworkCard {
  id: string;
  title: string;
  imageUrl?: string;
  likes: number;
  views: number;
  author: string;
}

// Type guard to check if an item is a UserResult
const isUserResult = (item: any): item is UserResult => {
  return 'username' in item && 'name' in item;
};

// Type guard to check if an item is a PostResult
const isPostResult = (item: any): item is PostResult => {
  return 'type' in item && 'caption' in item;
};

// Mock data for discovery sections (replace with API calls)
const mockTrendingHashtags: TrendingHashtag[] = [
  { id: '1', tag: 'digitalart', count: 245 },
  { id: '2', tag: 'photography', count: 189 },
  { id: '3', tag: 'art', count: 156 },
  { id: '4', tag: 'painting', count: 142 },
  { id: '5', tag: 'abstract', count: 128 },
  { id: '6', tag: 'portrait', count: 115 },
  { id: '7', tag: 'landscape', count: 98 },
  { id: '8', tag: 'minimalist', count: 87 },
  { id: '9', tag: 'surreal', count: 76 },
  { id: '10', tag: 'streetart', count: 65 },
];

const mockTopCreators: CreatorCard[] = [
  { id: '1', name: 'Alex Morgan', username: 'alexmorgan', verified: true },
  { id: '2', name: 'Taylor Swift', username: 'taylorswift', verified: true },
  { id: '3', name: 'Chris Evans', username: 'chrisevans', verified: false },
  { id: '4', name: 'Emma Watson', username: 'emmawatson', verified: true },
  { id: '5', name: 'Robert Downey', username: 'robertdowney', verified: true },
  { id: '6', name: 'Scarlett Johansson', username: 'scarlettj', verified: false },
];

const mockTrendingArtwork: ArtworkCard[] = [
  { id: '1', title: 'Midnight Dreams', likes: 342, views: 1200, author: 'alexmorgan' },
  { id: '2', title: 'Ocean Waves', likes: 289, views: 980, author: 'taylorswift' },
  { id: '3', title: 'Urban Jungle', likes: 256, views: 850, author: 'chrisevans' },
  { id: '4', title: 'Cosmic Dance', likes: 231, views: 720, author: 'emmawatson' },
  { id: '5', title: 'Desert Bloom', likes: 198, views: 650, author: 'robertdowney' },
  { id: '6', title: 'Mountain Peak', likes: 176, views: 580, author: 'scarlettj' },
];

export default function SearchScreen() {
  const router = useRouter();
  const theme: Theme = 'dark';
  const colors = Colors[theme];

  // State
  const [query, setQuery] = useState('');
  const [searchMode, setSearchMode] = useState<SearchMode>('global');
  const [loading, setLoading] = useState(false);
  const [sections, setSections] = useState<SearchSection[]>([]);
  const [focused, setFocused] = useState(false);
  const [selectedHashtag, setSelectedHashtag] = useState<string | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Detect search mode from query prefix
  useEffect(() => {
    if (query.startsWith('@')) {
      setSearchMode('users_only');
    } else if (query.startsWith('#')) {
      setSearchMode('hashtag');
    } else {
      setSearchMode('global');
    }
  }, [query]);

  // Search function
  const performSearch = async (searchQuery: string) => {
    try {
      const trimmedQuery = searchQuery.trim();
      const newSections: SearchSection[] = [];

      if (searchMode === 'users_only') {
        // Search users only (remove @ prefix)
        const userQuery = trimmedQuery.replace(/^@/, '');
        const usersResult = await pb.collection('users').getList(1, 5, {
          filter: `username ~ "${userQuery}" || name ~ "${userQuery}"`,
          sort: 'username',
        });

        if (usersResult.items.length > 0) {
          newSections.push({
            title: 'USERS',
            data: usersResult.items.map(item => ({
              id: item.id,
              username: item.username || '',
              name: item.name || '',
              profilePicture: item.profilePicture,
              verified: item.verified || false,
            })),
            type: 'users',
          });
        }
      } else if (searchMode === 'hashtag') {
        // Hashtag search (remove # prefix)
        const hashtagQuery = trimmedQuery.replace(/^#/, '');
        const postsResult = await pb.collection('posts').getList(1, 10, {
          filter: `text ~ "${hashtagQuery}" || caption ~ "${hashtagQuery}"`,
          sort: '-created',
          expand: 'author',
        });

        if (postsResult.items.length > 0) {
          newSections.push({
            title: 'POSTS',
            data: postsResult.items.map(item => ({
              id: item.id,
              type: item.type as 'text' | 'image' | 'video',
              text: item.text,
              caption: item.caption || '',
              field: item.field,
              author: item.author,
            })),
            type: 'posts',
          });
        }
      } else {
        // Global search: users first, then posts
        const usersResult = await pb.collection('users').getList(1, 5, {
          filter: `username ~ "${trimmedQuery}" || name ~ "${trimmedQuery}"`,
          sort: 'username',
        });

        if (usersResult.items.length > 0) {
          newSections.push({
            title: 'USERS',
            data: usersResult.items.map(item => ({
              id: item.id,
              username: item.username || '',
              name: item.name || '',
              profilePicture: item.profilePicture,
              verified: item.verified || false,
            })),
            type: 'users',
          });
        }

        const postsResult = await pb.collection('posts').getList(1, 10, {
          filter: `text ~ "${trimmedQuery}" || caption ~ "${trimmedQuery}"`,
          sort: '-created',
          expand: 'author',
        });

        if (postsResult.items.length > 0) {
          newSections.push({
            title: 'POSTS',
            data: postsResult.items.map(item => ({
              id: item.id,
              type: item.type as 'text' | 'image' | 'video',
              text: item.text,
              caption: item.caption || '',
              field: item.field,
              author: item.author,
            })),
            type: 'posts',
          });
        }
      }

      setSections(newSections);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Perform search with debounce
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      setSections([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    debounceTimer.current = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query, searchMode]);

  // Handle hashtag chip selection
  const handleHashtagSelect = (tag: string) => {
    setSelectedHashtag(tag);
    setQuery(`#${tag}`);
    setFocused(true);
  };

  // Navigate to user profile
  const navigateToUser = (userId: string) => {
    router.push(`/(profile)/${userId}`);
  };

  // Navigate to post
  const navigateToPost = (postId: string) => {
    router.push(`/(artwork)/${postId}`);
  };

  // Navigate to creator profile
  const navigateToCreator = (username: string) => {
    // First get user ID from username
    pb.collection('users').getList(1, 1, {
      filter: `username = "${username}"`,
    }).then(result => {
      if (result.items.length > 0) {
        router.push(`/(profile)/${result.items[0].id}`);
      }
    });
  };

  // Get placeholder text
  const getPlaceholder = () => {
    return 'Search for Creators, Artworks, Styles...';
  };

  // Render user card
  const renderUserCard = (user: UserResult) => {
    const avatarUrl = user.profilePicture
      ? pb.files.getURL(user, user.profilePicture)
      : null;

    return (
      <TouchableOpacity
        style={[styles.resultCard, { backgroundColor: '#1F2937', borderColor: '#333333' }]}
        onPress={() => navigateToUser(user.id)}
      >
        <View style={styles.userCardContent}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
          ) : (
            <View style={[styles.avatar, { backgroundColor: '#333333' }]}>
              <Text size={20} weight="600" style={{ color: '#fff' }}>
                {user.username.charAt(0).toUpperCase()}
              </Text>
            </View>
          )}

          <View style={styles.userInfo}>
            <View style={styles.userNameRow}>
              <Text size={15} weight="600" numberOfLines={1} style={{ color: '#fff' }}>
                {user.name || user.username}
              </Text>
              {user.verified && (
                <Text size={12} style={{ marginLeft: 4, color: '#FF5C02' }}>
                  ✓
                </Text>
              )}
            </View>
            <Text
              size={13}
              style={{ color: '#9CA3AF' }}
              numberOfLines={1}
            >
              @{user.username}
            </Text>
          </View>

          <Icons.Search size={16} color="#9CA3AF" />
        </View>
      </TouchableOpacity>
    );
  };

  // Render post preview
  const renderPostPreview = (post: PostResult) => {
    const preview =
      post.type === 'text'
        ? post.text
        : post.caption;

    return (
      <TouchableOpacity
        style={[styles.resultCard, { backgroundColor: '#1F2937', borderColor: '#333333' }]}
        onPress={() => navigateToPost(post.id)}
      >
        <View style={styles.postCardContent}>
          <Text
            size={11}
            weight="700"
            style={{
              color: '#FF5C02',
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}
          >
            {post.type}
          </Text>

          {preview && (
            <Text
              size={13}
              style={{ marginTop: 6, color: '#fff' }}
              numberOfLines={2}
            >
              {preview}
            </Text>
          )}

          {post.type === 'image' && post.field && (
            <View
              style={[
                styles.postThumbnail,
                { backgroundColor: '#333333' },
              ]}
            >
              <Icons.Upload size={24} color="#A855F7" />
            </View>
          )}

          {post.type === 'video' && post.field && (
            <View
              style={[
                styles.postThumbnail,
                { backgroundColor: '#333333' },
              ]}
            >
              <Text size={28} style={{ color: '#fff' }}>▶</Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  // Render section header
  const renderSectionHeader = ({ section }: { section: SearchSection }) => (
    <View style={[styles.sectionHeader, { backgroundColor: '#111827' }]}>
      <Text size={12} weight="700" style={{ color: '#9CA3AF' }}>
        {section.title}
      </Text>
    </View>
  );

  // Render result item
  const renderResultItem = ({ item, section }: { item: UserResult | PostResult; section: SearchSection }) => {
    if (section.type === 'users') {
      return renderUserCard(item as UserResult);
    }
    return renderPostPreview(item as PostResult);
  };

  // Render hashtag chip
  const renderHashtagChip = ({ item }: { item: TrendingHashtag }) => {
    const isSelected = selectedHashtag === item.tag;
    return (
      <TouchableOpacity
        style={[
          styles.hashtagChip,
          {
            backgroundColor: isSelected ? '#A855F7' : '#1F2937',
            borderColor: isSelected ? '#A855F7' : '#333333',
          },
        ]}
        onPress={() => handleHashtagSelect(item.tag)}
      >
        <Text size={13} weight="500" style={{ color: isSelected ? '#fff' : '#9CA3AF' }}>
          #{item.tag}
        </Text>
      </TouchableOpacity>
    );
  };

  // Render creator card
  const renderCreatorCard = ({ item }: { item: CreatorCard }) => (
    <TouchableOpacity
      style={styles.creatorCard}
      onPress={() => navigateToCreator(item.username)}
    >
      <View style={styles.creatorCardContent}>
        <View style={[styles.creatorAvatar, { backgroundColor: '#A855F7' }]}>
          <Text size={20} weight="600" style={{ color: '#fff' }}>
            {item.name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text size={12} weight="600" style={{ color: '#fff', marginTop: 8 }} numberOfLines={1}>
          {item.name}
        </Text>
        <Text size={10} style={{ color: '#9CA3AF' }} numberOfLines={1}>
          @{item.username}
        </Text>
      </View>
    </TouchableOpacity>
  );

  // Render artwork card
  const renderArtworkCard = ({ item }: { item: ArtworkCard }) => (
    <TouchableOpacity style={styles.artworkCard}>
      <View style={[styles.artworkImage, { backgroundColor: '#A855F7' }]}>
        <Text size={16} weight="600" style={{ color: '#fff' }}>
          {item.title}
        </Text>
      </View>
      <View style={styles.artworkInfo}>
        <Text size={11} weight="600" style={{ color: '#fff' }} numberOfLines={1}>
          {item.title}
        </Text>
        <View style={styles.artworkStats}>
          <Text size={9} style={{ color: '#9CA3AF' }}>
            ❤️ {item.likes}
          </Text>
          <Text size={9} style={{ color: '#9CA3AF', marginLeft: 8 }}>
            👁️ {item.views}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Check if in discovery mode (no query)
  const isDiscoveryMode = !query.trim();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#111827' }]}>
      {/* Search Bar */}
      <View style={styles.searchBarContainer}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: '#1F2937',
              borderColor: focused ? '#A855F7' : '#333333',
            },
          ]}
        >
          <Icons.Search size={20} color="#9CA3AF" />
          <TextInput
            style={[styles.searchInput, { color: '#fff' }]}
            placeholder={getPlaceholder()}
            placeholderTextColor="#9CA3AF"
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            returnKeyType="search"
            autoCapitalize="none"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <Text size={16} style={{ color: '#9CA3AF' }}>
                ✕
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Discovery Mode (when no query) */}
      {isDiscoveryMode ? (
        <ScrollView style={styles.discoveryContainer}>
          {/* Trending Hashtags */}
          <View style={styles.section}>
            <Text size={14} weight="700" style={{ color: '#fff', marginBottom: 12 }}>
              Trending Hashtags
            </Text>
            <FlatList
              data={mockTrendingHashtags}
              renderItem={renderHashtagChip}
              keyExtractor={item => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.hashtagList}
            />
          </View>

          {/* Top Creators */}
          <View style={styles.section}>
            <Text size={14} weight="700" style={{ color: '#fff', marginBottom: 12 }}>
              Top Creators
            </Text>
            <FlatList
              data={mockTopCreators}
              renderItem={renderCreatorCard}
              keyExtractor={item => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              contentContainerStyle={styles.creatorGrid}
            />
          </View>

          {/* Trending Artwork */}
          <View style={styles.section}>
            <Text size={14} weight="700" style={{ color: '#fff', marginBottom: 12 }}>
              Trending Artwork
            </Text>
            <FlatList
              data={mockTrendingArtwork}
              renderItem={renderArtworkCard}
              keyExtractor={item => item.id}
              numColumns={2}
              scrollEnabled={false}
              columnWrapperStyle={{ justifyContent: 'space-between' }}
              contentContainerStyle={styles.artworkGrid}
            />
          </View>
        </ScrollView>
      ) : (
        /* Search Results Mode */
        <>
          {sections.length > 0 ? (
            <SectionList
              sections={sections}
              keyExtractor={(item) => item.id}
              renderItem={renderResultItem}
              renderSectionHeader={renderSectionHeader}
              contentContainerStyle={styles.resultsList}
              scrollEnabled={true}
            />
          ) : (
            renderEmptyState()
          )}
        </>
      )}
    </SafeAreaView>
  );

  // Empty state for search results
  function renderEmptyState() {
    if (loading) {
      return (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#A855F7" />
          <Text size={14} style={{ marginTop: 12, color: '#9CA3AF' }}>
            Searching...
          </Text>
        </View>
      );
    }

    if (query.trim()) {
      return (
        <View style={styles.centerContainer}>
          <Icons.Search size={40} color="#9CA3AF" />
          <Text size={16} style={{ marginTop: 12, color: '#9CA3AF' }}>
            No results found
          </Text>
        </View>
      );
    }

    return null; // Should not reach here in discovery mode
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchBarContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 24,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Roboto',
  },
  discoveryContainer: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  section: {
    marginBottom: 24,
  },
  hashtagList: {
    gap: 8,
    paddingRight: 16,
  },
  hashtagChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  creatorGrid: {
    gap: 12,
  },
  creatorCard: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: '#1F2937',
    overflow: 'hidden',
  },
  creatorCardContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
  },
  creatorAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  artworkGrid: {
    gap: 12,
  },
  artworkCard: {
    width: '48%',
    borderRadius: 16,
    backgroundColor: '#1F2937',
    overflow: 'hidden',
  },
  artworkImage: {
    width: '100%',
    aspectRatio: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  artworkInfo: {
    padding: 10,
  },
  artworkStats: {
    flexDirection: 'row',
    marginTop: 4,
  },
  resultsList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  sectionHeader: {
    paddingVertical: 8,
    paddingHorizontal: 0,
    marginTop: 12,
    marginBottom: 6,
  },
  resultCard: {
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 10,
    padding: 12,
  },
  userCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  userNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postCardContent: {
    gap: 8,
  },
  postThumbnail: {
    width: '100%',
    height: 100,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
});