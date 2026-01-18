import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState, useRef, useMemo, useCallback } from 'react';
import {
  View,
  FlatList,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Text as RNText,
  ScrollView,
} from 'react-native';
import { Image } from 'expo-image';
import { useVideoPlayer, VideoView } from 'expo-video';
import { pb } from '@/lib/pb';
import Text from '@/components/Text';
import { Colors, Theme } from '@/constants/Colors';
import * as Icons from '@/components/icons';

interface Comment {
  id: string;
  content: string;
  user: string;
  artwork: string;
  created: string;
  expand?: {
    user?: {
      id: string;
      username: string;
      name: string;
      profilePicture?: string;
    };
  };
}

interface Entity {
  type: 'mention' | 'hashtag';
  value: string;
  startIndex: number;
  endIndex: number;
}

interface Suggestion {
  id: string;
  type: 'user' | 'hashtag';
  value: string;
  name?: string;
}

const COMMENT_MAX_LENGTH = 1000;
const INITIAL_COMMENTS_COUNT = 20;

export default function CommentsScreen() {
  const { artwork_id } = useLocalSearchParams<{ artwork_id: string }>();
  const router = useRouter();
  const theme: Theme = 'dark';
  const colors = Colors[theme];

  const [loading, setLoading] = useState(true);
  const [artwork, setArtwork] = useState<any>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [commentCount, setCommentCount] = useState(0);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [triggerChar, setTriggerChar] = useState<'@' | '#' | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const currentUser = pb.authStore.model;
  const flatListRef = useRef<FlatList>(null);
  const inputRef = useRef<TextInput>(null);

  const mediaUrl = artwork?.field ? pb.files.getURL(artwork, artwork.field) : null;

  const videoPlayer = useMemo(() => {
    if (artwork?.type === 'video' && mediaUrl) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      return useVideoPlayer(mediaUrl);
    }
    return null;
  }, [artwork?.type, mediaUrl]);

  // Fetch artwork and comments
  useEffect(() => {
    if (!artwork_id) {
      return;
    }

    const fetchData = async () => {
      try {
        const artworkRecord = await pb.collection('posts').getOne(artwork_id, {
          expand: 'author',
        });
        setArtwork(artworkRecord);

        const likes = await pb.collection('artwork_likes').getList(1, 1, {
          filter: `artwork="${artworkRecord.id}"`,
        });
        setLikeCount(likes.totalItems);

        const commentsResult = await pb
          .collection('artwork_comments')
          .getList(1, INITIAL_COMMENTS_COUNT, {
            filter: `artwork="${artworkRecord.id}"`,
            sort: '-created',
            expand: 'user',
          });

        setComments(commentsResult.items as unknown as Comment[]);
        setCommentCount(commentsResult.totalItems);
      } catch (err) {
        console.error('Error fetching data:', err);
        Alert.alert('Error', 'Failed to load artwork');
        router.back();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [artwork_id, router]);

  // Handle suggestions
  useEffect(() => {
    if (!showSuggestions || !searchQuery) {
      setSuggestions([]);
      return;
    }

    const fetchSuggestions = async () => {
      try {
        if (triggerChar === '@') {
          // Search users
          const users = await pb.collection('users').getList(1, 5, {
            filter: `username ~ "${searchQuery}" || name ~ "${searchQuery}"`,
            sort: 'username',
          });

          setSuggestions(
            users.items.map((user) => ({
              id: user.id,
              type: 'user' as const,
              value: user.username,
              name: user.name,
            }))
          );
        } else if (triggerChar === '#') {
          // Mock hashtag search - you can replace with actual hashtag collection
          const commonHashtags = [
            'art',
            'design',
            'illustration',
            'animation',
            'creative',
            'digital',
            'artwork',
            'sketch',
            'portfolio',
            'visual',
          ];

          const filtered = commonHashtags
            .filter((tag) => tag.includes(searchQuery.toLowerCase()))
            .slice(0, 5);

          setSuggestions(
            filtered.map((tag) => ({
              id: tag,
              type: 'hashtag' as const,
              value: tag,
            }))
          );
        }
      } catch (err) {
        console.error('Error fetching suggestions:', err);
      }
    };

    const debounceTimer = setTimeout(fetchSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, triggerChar, showSuggestions]);

  // Handle text change with mention/hashtag detection
  const handleTextChange = useCallback((text: string) => {
    setCommentText(text);

    // Find the last @ or # character and determine if we should show suggestions
    const lastAtIndex = text.lastIndexOf('@');
    const lastHashIndex = text.lastIndexOf('#');
    const lastTriggerIndex = Math.max(lastAtIndex, lastHashIndex);

    if (lastTriggerIndex === -1) {
      setShowSuggestions(false);
      return;
    }

    const charAtTrigger = text[lastTriggerIndex];
    const afterTrigger = text.substring(lastTriggerIndex + 1);

    // Check if there's a space after trigger (if so, don't show suggestions)
    if (afterTrigger.includes(' ')) {
      setShowSuggestions(false);
      return;
    }

    // Check if we're still in a valid mention/hashtag context
    const isValidContext = /^[a-zA-Z0-9_.]*$/.test(afterTrigger);
    if (!isValidContext) {
      setShowSuggestions(false);
      return;
    }

    setTriggerChar(charAtTrigger as '@' | '#');
    setSearchQuery(afterTrigger);
    setShowSuggestions(afterTrigger.length > 0);
  }, []);

  // Insert suggestion
  const insertSuggestion = useCallback((suggestion: Suggestion) => {
    const lastTriggerIndex = Math.max(
      commentText.lastIndexOf('@'),
      commentText.lastIndexOf('#')
    );

    if (lastTriggerIndex === -1) return;

    const beforeTrigger = commentText.substring(0, lastTriggerIndex);
    const replacementText =
      triggerChar === '@'
        ? `@${suggestion.value} `
        : `#${suggestion.value} `;

    const newText = beforeTrigger + replacementText;
    setCommentText(newText);
    setShowSuggestions(false);
    setSearchQuery('');

    // Focus input and move cursor to end
    inputRef.current?.focus();
  }, [commentText, triggerChar]);

  // Parse mentions and hashtags from text
  const parseEntities = (text: string): Entity[] => {
    const entities: Entity[] = [];

    const mentionRegex = /@([a-zA-Z0-9_\.]+)/g;
    let match;
    while ((match = mentionRegex.exec(text)) !== null) {
      entities.push({
        type: 'mention',
        value: match[1],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    const hashtagRegex = /#([a-zA-Z0-9_]+)/g;
    while ((match = hashtagRegex.exec(text)) !== null) {
      entities.push({
        type: 'hashtag',
        value: match[1],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
      });
    }

    return entities.sort((a, b) => a.startIndex - b.startIndex);
  };

  // Render comment content with mentions and hashtags
  const renderCommentContent = useCallback((content: string) => {
    const entities = parseEntities(content);

    if (entities.length === 0) {
      return (
        <Text size={14} compactness={-2}>
          {content}
        </Text>
      );
    }

    const parts: any[] = [];
    let lastIndex = 0;

    entities.forEach((entity) => {
      if (lastIndex < entity.startIndex) {
        parts.push({
          type: 'text',
          content: content.slice(lastIndex, entity.startIndex),
        });
      }

      parts.push({
        type: entity.type,
        content: content.slice(entity.startIndex, entity.endIndex),
        value: entity.value,
      });

      lastIndex = entity.endIndex;
    });

    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.slice(lastIndex),
      });
    }

    return (
      <Text size={14} compactness={-2}>
        {parts.map((part, idx) => {
          if (part.type === 'text') {
            return <RNText key={idx}>{part.content}</RNText>;
          }

          if (part.type === 'mention') {
            return (
              <RNText
                key={idx}
                style={{ color: Colors.dark.blue }}
                onPress={() => router.push(`/(profile)/${part.value}`)}
              >
                {part.content}
              </RNText>
            );
          }

          if (part.type === 'hashtag') {
            return (
              <RNText
                key={idx}
                style={{ color: Colors.dark.blue }}
                onPress={() => router.push(`/(search)?tag=${part.value}`)}
              >
                {part.content}
              </RNText>
            );
          }

          return null;
        })}
      </Text>
    );
  }, [router]);

  // Format relative timestamp
  const formatTime = useCallback((dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'now';
    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;

    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }, []);

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!currentUser) {
      Alert.alert('Login required', 'Please log in to comment');
      return;
    }

    const trimmedText = commentText.trim();
    if (!trimmedText || trimmedText.length === 0) {
      Alert.alert('Empty comment', 'Please write something');
      return;
    }

    if (trimmedText.length > COMMENT_MAX_LENGTH) {
      Alert.alert(
        'Comment too long',
        `Maximum ${COMMENT_MAX_LENGTH} characters`
      );
      return;
    }

    setSubmittingComment(true);

    try {
      const newComment = await pb.collection('artwork_comments').create({
        user: currentUser.id,
        artwork: artwork_id,
        content: trimmedText,
      });

      const optimisticComment: Comment = {
        id: newComment.id,
        content: newComment.content,
        user: newComment.user,
        artwork: newComment.artwork,
        created: newComment.created,
        expand: {
          user: {
            id: currentUser.id,
            username: currentUser.username,
            name: currentUser.name,
            profilePicture: currentUser.profilePicture,
          },
        },
      };

      setComments([optimisticComment, ...comments]);
      setCommentCount((c) => c + 1);
      setCommentText('');
      inputRef.current?.blur();
    } catch (err) {
      console.error('Comment submission error:', err);
      Alert.alert('Error', 'Failed to post comment');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Render comment item - memoized to prevent re-renders
  const renderCommentItem = useCallback(
    ({ item }: { item: Comment }) => {
      const author = item.expand?.user;

      if (!author) {
        return null;
      }

      return (
        <View style={[styles.commentItem, { borderBottomColor: colors.grey }]}>
          <TouchableOpacity
            onPress={() => router.push(`/(profile)/${author.id}`)}
            style={styles.commentAuthorSection}
          >
            <View
              style={[
                styles.commentAvatar,
                { backgroundColor: colors.purple },
              ]}
            >
              <Text size={14} weight="600" style={{ color: '#fff' }}>
                {author.username?.[0]?.toUpperCase() || '?'}
              </Text>
            </View>
          </TouchableOpacity>

          <View style={styles.commentContent}>
            <TouchableOpacity
              onPress={() => router.push(`/(profile)/${author.id}`)}
            >
              <View style={styles.commentHeader}>
                <Text size={14} weight="600" style={{ color: colors.fg }}>
                  {author.name || author.username}
                </Text>
                <Text size={13} style={{ color: colors.light_grey }}>
                  {' '}
                  @{author.username}
                </Text>
                <Text size={13} style={{ color: colors.light_grey }}>
                  {' '}
                  · {formatTime(item.created)}
                </Text>
              </View>
            </TouchableOpacity>

            <View style={{ marginTop: 6 }}>
              {renderCommentContent(item.content)}
            </View>
          </View>
        </View>
      );
    },
    [colors, router, formatTime, renderCommentContent]
  );

  // Render artwork header - memoized to prevent re-renders
  const renderArtworkHeader = useCallback(() => {
    if (!artwork) return null;

    const author = artwork.expand?.author;
    if (!author) return null;

    const mediaUrl = artwork.field
      ? pb.files.getURL(artwork, artwork.field)
      : null;

    return (
      <View style={[styles.artworkHeader, { borderBottomColor: colors.grey }]}>
        <TouchableOpacity
          style={styles.authorRow}
          onPress={() => router.push(`/(profile)/${author.id}`)}
        >
          <View
            style={[
              styles.authorAvatar,
              { backgroundColor: colors.purple },
            ]}
          >
            <Text size={18} weight="600" style={{ color: '#fff' }}>
              {author.username?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
          <View style={styles.authorInfo}>
            <Text size={14} weight="600" style={{ color: colors.fg }}>
              {author.name || author.username}
            </Text>
            <Text size={12} style={{ color: colors.light_grey }}>
              @{author.username}
            </Text>
          </View>
        </TouchableOpacity>

        {artwork.type === 'image' && mediaUrl && (
          <Image
            source={{ uri: mediaUrl }}
            style={[styles.artworkMedia, { backgroundColor: colors.bg1 }]}
            contentFit="cover"
          />
        )}

        {artwork.type === 'video' && mediaUrl && videoPlayer && (
          <VideoView
            player={videoPlayer}
            style={[styles.artworkMedia, { backgroundColor: colors.bg1 }]}
            nativeControls
            allowsFullscreen
          />
        )}

        {artwork.type === 'text' && (
          <View style={[styles.artworkText, { backgroundColor: colors.bg1 }]}>
            <Text size={15} style={{ color: colors.fg, lineHeight: 22 }}>
              {artwork.text}
            </Text>
          </View>
        )}

        {artwork.caption && (
          <Text size={13} style={[styles.caption, { color: colors.light_grey }]}>
            {artwork.caption}
          </Text>
        )}

        <View style={[styles.engagementSummary, { borderTopColor: colors.grey }]}>
          <Text size={12} style={{ color: colors.light_grey }}>
            <Text weight="600" style={{ color: colors.fg }}>
              {likeCount}
            </Text>
            {' '}
            Like{likeCount !== 1 ? 's' : ''}
          </Text>
          <Text size={12} style={{ color: colors.light_grey }}>
            <Text weight="600" style={{ color: colors.fg }}>
              {commentCount}
            </Text>
            {' '}
            Comment{commentCount !== 1 ? 's' : ''}
          </Text>
        </View>
      </View>
    );
  }, [artwork, colors, router, likeCount, commentCount, videoPlayer]);

  // Render empty comments state
  const renderEmptyComments = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text size={16} weight="600" style={{ color: colors.fg }}>
        No comments yet
      </Text>
      <Text size={14} style={[styles.emptySubtext, { color: colors.light_grey }]}>
        Be the first to comment
      </Text>
    </View>
  ), [colors]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg0 }]}>
        <View style={[styles.header, { borderBottomColor: colors.grey }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icons.ChevronLeft size={24} color={colors.fg} />
          </TouchableOpacity>
          <Text size={16} weight="700" style={{ color: colors.fg }}>
            Comments
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={colors.blue} />
        </View>
      </View>
    );
  }

  if (!artwork) {
    return (
      <View style={[styles.container, { backgroundColor: colors.bg0 }]}>
        <View style={[styles.header, { borderBottomColor: colors.grey }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Icons.ChevronLeft size={24} color={colors.fg} />
          </TouchableOpacity>
          <Text size={16} weight="700" style={{ color: colors.fg }}>
            Comments
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <View style={styles.center}>
          <Text size={16} style={{ color: colors.fg }}>
            Artwork not found
          </Text>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.bg0 }]}
    >
      <View style={[styles.header, { borderBottomColor: colors.grey }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Icons.ChevronLeft size={24} color={colors.fg} />
        </TouchableOpacity>
        <Text size={16} weight="700" style={{ color: colors.fg }}>
          Comments
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={{ flex: 1, position: 'relative' }}>
        <FlatList
          ref={flatListRef}
          data={comments}
          keyExtractor={(item) => item.id}
          renderItem={renderCommentItem}
          ListHeaderComponent={renderArtworkHeader}
          ListEmptyComponent={
            !loading && comments.length === 0 ? renderEmptyComments : null
          }
          contentContainerStyle={styles.listContent}
          scrollEnabled={true}
        />

        {/* Autocomplete Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <View
            style={[
              styles.suggestionsContainer,
              { backgroundColor: colors.bg1, borderTopColor: colors.grey },
            ]}
          >
            <ScrollView nestedScrollEnabled style={{ maxHeight: 200 }}>
              {suggestions.map((suggestion) => (
                <TouchableOpacity
                  key={suggestion.id}
                  style={[
                    styles.suggestionItem,
                    { borderBottomColor: colors.grey },
                  ]}
                  onPress={() => insertSuggestion(suggestion)}
                >
                  {suggestion.type === 'user' ? (
                    <>
                      <View
                        style={[
                          styles.suggestionAvatar,
                          { backgroundColor: colors.purple },
                        ]}
                      >
                        <Text size={10} weight="600" style={{ color: '#fff' }}>
                          {suggestion.value?.[0]?.toUpperCase() || '?'}
                        </Text>
                      </View>
                      <View>
                        <Text size={13} weight="600" style={{ color: colors.fg }}>
                          {suggestion.name || suggestion.value}
                        </Text>
                        <Text size={12} style={{ color: colors.light_grey }}>
                          @{suggestion.value}
                        </Text>
                      </View>
                    </>
                  ) : (
                    <Text size={13} style={{ color: colors.blue }}>
                      #{suggestion.value}
                    </Text>
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>

      <View
        style={[
          styles.composer,
          {
            backgroundColor: colors.bg0,
            borderTopColor: colors.grey,
          },
        ]}
      >
        {currentUser && (
          <View
            style={[
              styles.composerAvatar,
              { backgroundColor: colors.purple },
            ]}
          >
            <Text size={12} weight="600" style={{ color: '#fff' }}>
              {currentUser.username?.[0]?.toUpperCase() || '?'}
            </Text>
          </View>
        )}

        <View style={styles.composerInputContainer}>
          <TextInput
            ref={inputRef}
            style={[
              styles.composerInput,
              {
                color: colors.fg,
                borderColor: colors.grey,
                backgroundColor: colors.bg1,
              },
            ]}
            placeholder="Add a comment..."
            placeholderTextColor={colors.light_grey}
            value={commentText}
            onChangeText={handleTextChange}
            maxLength={COMMENT_MAX_LENGTH}
            multiline
            editable={!submittingComment}
          />

          <TouchableOpacity
            style={[
              styles.sendButton,
              {
                backgroundColor:
                  commentText.trim().length > 0 && !submittingComment
                    ? colors.blue
                    : colors.bg1,
              },
            ]}
            onPress={handleSubmitComment}
            disabled={submittingComment || commentText.trim().length === 0}
          >
            {submittingComment ? (
              <ActivityIndicator size={16} color={colors.light_grey} />
            ) : (
              <Icons.Sent
                size={18}
                color={
                  commentText.trim().length > 0 ? '#fff' : colors.light_grey
                }
              />
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingBottom: 16,
  },
  artworkHeader: {
    borderBottomWidth: 1,
    paddingVertical: 12,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  authorAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  authorInfo: {
    flex: 1,
  },
  artworkMedia: {
    width: '100%',
    height: 300,
    marginVertical: 12,
  },
  artworkText: {
    marginHorizontal: 16,
    marginVertical: 12,
    padding: 16,
    borderRadius: 8,
  },
  caption: {
    paddingHorizontal: 16,
    marginVertical: 12,
  },
  engagementSummary: {
    flexDirection: 'row',
    gap: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    marginTop: 12,
  },
  commentItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  commentAuthorSection: {
    marginRight: 10,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  commentContent: {
    flex: 1,
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptySubtext: {
    marginTop: 8,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderTopWidth: 1,
    gap: 10,
  },
  composerAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  composerInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  composerInput: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 100,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  suggestionsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxHeight: 200,
    borderTopWidth: 1,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    gap: 8,
  },
  suggestionAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
});