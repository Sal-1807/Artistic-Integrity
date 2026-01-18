import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useMemo } from 'react';
import {
  View,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import * as Clipboard from 'expo-clipboard';

import { pb } from '@/lib/pb';
import Text from '@/components/Text';
import { Colors, Theme } from '@/constants/Colors';
import * as Icons from '@/components/icons';

export default function ArtworkDetail() {
  const { artwork_id } = useLocalSearchParams<{ artwork_id: string }>();
  const router = useRouter();
  const theme: Theme = 'dark';
  const colors = Colors[theme];

  const [loading, setLoading] = useState(true);
  const [artwork, setArtwork] = useState<any>(null);

  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);

  const currentUser = pb.authStore.model;

  // Video player - memoized to avoid recreating on every render
  const videoPlayer = useMemo(() => {
    if (artwork?.type === 'video' && artwork?.field) {
      const mediaUrl = pb.files.getURL(artwork, artwork.field);
      return useVideoPlayer(mediaUrl);
    }
    return null;
  }, [artwork]);

  // Fetch artwork + engagement
  useEffect(() => {
    const fetchArtwork = async () => {
      try {
        if (!artwork_id) {
          router.back();
          return;
        }

        const record = await pb.collection('posts').getOne(artwork_id, {
          expand: 'author',
        });

        setArtwork(record);

        // Likes count
        const likes = await pb.collection('artwork_likes').getList(1, 1, {
          filter: `artwork="${record.id}"`,
        });
        setLikeCount(likes.totalItems);

        if (currentUser) {
          // Check if current user liked this artwork
          const userLike = await pb.collection('artwork_likes').getList(1, 1, {
            filter: `user="${currentUser.id}" && artwork="${record.id}"`,
          });
          setIsLiked(userLike.items.length > 0);

          // Check if current user saved this artwork
          const saved = await pb.collection('saved_artworks').getList(1, 1, {
            filter: `user="${currentUser.id}" && artwork="${record.id}"`,
          });
          setIsSaved(saved.items.length > 0);
        }

        // Comments count
        const comments = await pb.collection('artwork_comments').getList(1, 1, {
          filter: `artwork="${record.id}"`,
        });
        setCommentCount(comments.totalItems);
      } catch (err) {
        console.error(err);
        Alert.alert('Error', 'Failed to load artwork');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchArtwork();
  }, [artwork_id, currentUser]);

  const handleLike = async () => {
    if (!currentUser) {
      return Alert.alert('Login required', 'Please log in to like artworks');
    }

    if (!artwork) return;

    try {
      if (isLiked) {
        // Unlike: find and delete the like record
        const existing = await pb.collection('artwork_likes').getList(1, 1, {
          filter: `user="${currentUser.id}" && artwork="${artwork.id}"`,
        });
        if (existing.items[0]) {
          await pb.collection('artwork_likes').delete(existing.items[0].id);
          setIsLiked(false);
          setLikeCount((c) => Math.max(0, c - 1));
        }
      } else {
        // Like: create new like record
        await pb.collection('artwork_likes').create({
          user: currentUser.id,
          artwork: artwork.id,
        });
        setIsLiked(true);
        setLikeCount((c) => c + 1);
      }
    } catch (e) {
      console.error('Like error:', e);
      Alert.alert('Error', 'Failed to update like status');
    }
  };

  const handleSave = async () => {
    if (!currentUser) {
      return Alert.alert('Login required', 'Please log in to save artworks');
    }

    if (!artwork) return;

    try {
      if (isSaved) {
        // Unsave: find and delete the saved record
        const saved = await pb.collection('saved_artworks').getList(1, 1, {
          filter: `user="${currentUser.id}" && artwork="${artwork.id}"`,
        });
        if (saved.items[0]) {
          await pb.collection('saved_artworks').delete(saved.items[0].id);
          setIsSaved(false);
        }
      } else {
        // Save: create new saved record
        await pb.collection('saved_artworks').create({
          user: currentUser.id,
          artwork: artwork.id,
        });
        setIsSaved(true);
      }
    } catch (e) {
      console.error('Save error:', e);
      Alert.alert('Error', 'Failed to update save status');
    }
  };

  const handleShare = async () => {
    if (!artwork) return;

    try {
      await Clipboard.setStringAsync(`myapp://artwork/${artwork.id}`);
      Alert.alert('Success', 'Artwork link copied to clipboard');
    } catch (e) {
      console.error('Share error:', e);
      Alert.alert('Error', 'Failed to copy link');
    }
  };

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg0 }]}>
        <ActivityIndicator size="large" color={colors.blue} />
        <Text size={14} style={{ marginTop: 12, color: colors.light_grey }}>
          Loading artwork...
        </Text>
      </View>
    );
  }

  if (!artwork) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg0 }]}>
        <Text size={16} style={{ color: colors.fg }}>
          Artwork not found
        </Text>
        <TouchableOpacity
          style={[styles.backButton, { backgroundColor: colors.bg1 }]}
          onPress={() => router.back()}
        >
          <Text size={14} style={{ color: colors.blue }}>
            Go Back
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const author = artwork.expand?.author;
  const mediaUrl = artwork.field ? pb.files.getURL(artwork, artwork.field) : null;

  if (!author) {
    return (
      <View style={[styles.center, { backgroundColor: colors.bg0 }]}>
        <Text size={16} style={{ color: colors.fg }}>
          Author information not available
        </Text>
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.bg0 }]}>
      {/* Header with Author Info */}
      <TouchableOpacity
        style={[styles.creatorHeader, { borderBottomColor: colors.grey }]}
        onPress={() => router.push(`/(profile)/${author.id}`)}
      >
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.purple },
          ]}
        >
          <Text weight="600" size={20} style={{ color: '#fff' }}>
            {author.username?.[0]?.toUpperCase() || '?'}
          </Text>
        </View>
        <View style={styles.authorInfo}>
          <Text weight="600" size={15} style={{ color: colors.fg }}>
            {author.name || author.username}
          </Text>
          <Text size={13} style={{ color: colors.light_grey }}>
            @{author.username}
          </Text>
        </View>
      </TouchableOpacity>

      {/* Media Content */}
      {artwork.type === 'image' && mediaUrl && (
        <Image
          source={{ uri: mediaUrl }}
          style={[styles.media, { backgroundColor: colors.bg1 }]}
          contentFit="cover"
        />
      )}

      {artwork.type === 'video' && mediaUrl && videoPlayer && (
        <VideoView
          player={videoPlayer}
          style={[styles.media, { backgroundColor: colors.bg1 }]}
          nativeControls
          allowsFullscreen
        />
      )}

      {artwork.type === 'text' && (
        <View style={[styles.textBox, { backgroundColor: colors.bg1 }]}>
          <Text size={16} style={{ color: colors.fg, lineHeight: 24 }}>
            {artwork.text}
          </Text>
        </View>
      )}

      {/* Caption */}
      {artwork.caption && (
        <View style={styles.captionContainer}>
          <Text size={14} style={{ color: colors.light_grey }}>
            {artwork.caption}
          </Text>
        </View>
      )}

      {/* Engagement Actions */}
      <View
        style={[
          styles.actions,
          {
            backgroundColor: colors.bg1,
            borderTopColor: colors.grey,
            borderBottomColor: colors.grey,
          },
        ]}
      >
        {/* Like */}
        <TouchableOpacity style={styles.actionItem} onPress={handleLike}>
          <Icons.Heart
            size={22}
            color={isLiked ? '#FF5C02' : colors.light_grey}
            fill={isLiked ? '#FF5C02' : 'transparent'}
          />
          <Text size={13} style={{ color: colors.light_grey, marginLeft: 6 }}>
            {likeCount}
          </Text>
        </TouchableOpacity>

        {/* Comments */}
        <TouchableOpacity
          style={styles.actionItem}
          onPress={() => router.push(`/comments/${artwork.id}`)}
        >
          <Icons.MessageCircle size={22} color={colors.light_grey} />
          <Text size={13} style={{ color: colors.light_grey, marginLeft: 6 }}>
            {commentCount}
          </Text>
        </TouchableOpacity>

        {/* Share */}
        <TouchableOpacity style={styles.actionItem} onPress={handleShare}>
          <Icons.Share2 size={22} color={colors.light_grey} />
        </TouchableOpacity>

        {/* Save */}
        <TouchableOpacity style={styles.actionItem} onPress={handleSave}>
          <Icons.Bookmark
            size={22}
            color={isSaved ? '#FF5C02' : colors.light_grey}
            fill={isSaved ? '#FF5C02' : 'transparent'}
          />
        </TouchableOpacity>
      </View>

      {/* Spacing */}
      <View style={{ height: 20 }} />
    </ScrollView>
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
  creatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  authorInfo: {
    flex: 1,
  },
  media: {
    width: '100%',
    height: 400,
    marginVertical: 12,
  },
  textBox: {
    margin: 16,
    padding: 20,
    borderRadius: 12,
    minHeight: 120,
  },
  captionContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    marginVertical: 12,
    gap: 16,
  },
  actionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-start',
  },
  backButton: {
    marginTop: 20,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
});