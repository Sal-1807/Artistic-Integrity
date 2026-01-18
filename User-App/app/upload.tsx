import React, { useState, useRef } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
  FlatList,
} from 'react-native';
import { Image } from 'expo-image';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import * as VideoThumbnails from 'expo-video-thumbnails';
import { useRouter } from 'expo-router';
import { pb } from '@/lib/pb';
import Text from '@/components/Text';
import Button from '@/components/Button';
import Input from '@/components/Input';
import { Colors, Theme } from '@/constants/Colors';
import * as Icons from '@/components/icons';

type PostType = 'text' | 'image' | 'video';

interface PostData {
  type: PostType;
  text: string;
  caption: string;
  mediaUri?: string;
  selectedImages?: Array<{ uri: string; id: string }>;
  mediaThumbnail?: string;
}

interface SelectedImage {
  uri: string;
  id: string;
}

export default function UploadScreen() {
  const router = useRouter();
  const theme: Theme = 'dark';
  const colors = Colors[theme];
  const user = pb.authStore.model;

  // State
  const [activeTab, setActiveTab] = useState<PostType>('image'); // Default to image tab
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [postData, setPostData] = useState<PostData>({
    type: 'image',
    text: '',
    caption: '',
    selectedImages: [],
  });

  const textInputRef = useRef<TextInput>(null);

  // Update post data
  const updatePostData = (field: keyof PostData, value: any) => {
    setPostData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Switch tab
  const switchTab = (newTab: PostType) => {
    setActiveTab(newTab);
    setPostData(prev => ({ ...prev, type: newTab }));
    setErrors({});
    
    if (newTab === 'text') {
      setTimeout(() => textInputRef.current?.focus(), 100);
    }
  };

  // Validate current tab
  const validatePost = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (activeTab === 'text') {
      if (!postData.text.trim()) {
        newErrors.text = 'Text cannot be empty';
      } else if (postData.text.length > 5000) {
        newErrors.text = 'Text exceeds 5000 character limit';
      }
    } else if (activeTab === 'image') {
      if (!postData.selectedImages || postData.selectedImages.length === 0) {
        newErrors.image = 'Please select at least one image';
      } else if (postData.selectedImages.length > 20) {
        newErrors.image = 'Maximum 20 images allowed';
      }
    } else if (activeTab === 'video') {
      if (!postData.mediaUri) {
        newErrors.video = 'Please select a video';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Pick images
  const pickImages = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        allowsEditing: false,
        allowsMultipleSelection: true,
        quality: 0.8,
        selectionLimit: 20,
      });

      if (!result.canceled && result.assets.length > 0) {
        const newImages = result.assets.map((asset, index) => ({
          uri: asset.uri,
          id: `${Date.now()}_${index}`,
        }));
        
        const currentImages = postData.selectedImages || [];
        const allImages = [...currentImages, ...newImages];
        
        // Limit to 20 images
        const limitedImages = allImages.slice(0, 20);
        
        updatePostData('selectedImages', limitedImages);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick images');
    }
  };

  // Remove image
  const removeImage = (imageId: string) => {
    const updatedImages = (postData.selectedImages || []).filter(
      img => img.id !== imageId
    );
    updatePostData('selectedImages', updatedImages);
  };

  // Pick video
  const pickVideo = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        videoQuality: 1,
      });

      if (!result.canceled && result.assets[0].uri) {
        updatePostData('mediaUri', result.assets[0].uri);

        // Generate thumbnail
        try {
          const { uri } = await VideoThumbnails.getThumbnailAsync(
            result.assets[0].uri,
            { time: 0 }
          );
          updatePostData('mediaThumbnail', uri);
        } catch (err) {
          console.warn('Failed to generate video thumbnail:', err);
        }
      }
    } catch (error) {
      console.error('Video picker error:', error);
      Alert.alert('Error', 'Failed to pick video');
    }
  };

  // Create post
  const handleCreatePost = async () => {
    if (!validatePost() || !user) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('type', activeTab);
      formData.append('author', user.id);

      if (activeTab === 'text') {
        formData.append('text', postData.text.trim());
        const caption = postData.caption.trim() || '';
        if (caption) formData.append('caption', caption);
      } else if (activeTab === 'image') {
        // Use provided caption or empty string
        const caption = postData.caption.trim() || '';
        formData.append('caption', caption);

        // Append image files (only first image for now - can extend to multiple)
        const images = postData.selectedImages || [];
        if (images.length > 0) {
          const image = images[0];
          const fileName = `post_${Date.now()}.jpg`;
          
          formData.append('field', {
            uri: image.uri,
            name: fileName,
            type: 'image/jpeg',
          } as any);
        }
      } else if (activeTab === 'video') {
        const caption = postData.caption.trim() || '';
        formData.append('caption', caption);

        // Append video file
        const mediaUri = postData.mediaUri;
        if (mediaUri) {
          const fileName = `post_${Date.now()}.mp4`;
          formData.append('field', {
            uri: mediaUri,
            name: fileName,
            type: 'video/mp4',
          } as any);
        }
      }

      // Create post
      await pb.collection('posts').create(formData);

      Alert.alert('Success', `${activeTab === 'text' ? 'Post' : 'Upload'} created!`, [
        {
          text: 'OK',
          onPress: () => {
            // Reset form
            setPostData({ 
              type: 'image', 
              text: '', 
              caption: '',
              selectedImages: [] 
            });
            setActiveTab('image');
            setErrors({});
            
            // Redirect to verify page
            router.push('/verify');
          },
        },
      ]);
    } catch (error: any) {
      console.error('Post creation error:', error);
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create post'
      );
    } finally {
      setLoading(false);
    }
  };

  // Render image grid item
  const renderImageItem = ({ item }: { item: SelectedImage }) => (
    <View style={styles.imageItemContainer}>
      <Image
        source={{ uri: item.uri }}
        style={styles.imageItem}
        contentFit="cover"
      />
      <TouchableOpacity
        style={styles.removeImageButton}
        onPress={() => removeImage(item.id)}
      >
        <Text size={16} weight="600" style={{ color: '#fff' }}>
          ×
        </Text>
      </TouchableOpacity>
    </View>
  );

  const hasImages = postData.selectedImages && postData.selectedImages.length > 0;
  const imageCount = postData.selectedImages?.length || 0;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: '#111827' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: '#111827' }]}>
        <Text size={24} weight="700" style={{ color: '#fff' }}>
          Create Post
        </Text>
      </View>

      {/* Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: '#111827' }]}>
        {(['text', 'image', 'video'] as PostType[]).map(tab => (
          <TouchableOpacity
            key={tab}
            style={styles.tab}
            onPress={() => switchTab(tab)}
          >
            <Text
              size={16}
              weight={activeTab === tab ? '600' : '400'}
              style={{
                color: activeTab === tab ? '#A855F7' : '#94a3b8',
                textTransform: 'capitalize',
              }}
            >
              {tab}
            </Text>
            {activeTab === tab && (
              <View
                style={[
                  styles.tabUnderline,
                  { backgroundColor: '#A855F7' },
                ]}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Content Area */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
      >
        {/* Text Tab */}
        {activeTab === 'text' && (
          <View>
            <TextInput
              ref={textInputRef}
              placeholder="What do you want to share?"
              placeholderTextColor={'#94a3b8'}
              value={postData.text}
              onChangeText={text => updatePostData('text', text)}
              multiline
              maxLength={5000}
              style={[
                styles.textInput,
                {
                  backgroundColor: '#111827',
                  color: '#fff',
                  borderColor: errors.text ? '#FF5C02' : '#333333',
                },
              ]}
            />
            <View style={styles.charCount}>
              <Text
                size={12}
                style={{
                  color: postData.text.length > 4500 ? '#FF5C02' : '#94a3b8',
                }}
              >
                {postData.text.length} / 5000
              </Text>
            </View>
            {errors.text && (
              <Text size={12} style={{ marginTop: 8, color: '#FF5C02' }}>
                {errors.text}
              </Text>
            )}

            {/* Caption for Text Tab */}
            <Input
              label="Caption (optional)"
              placeholder="Add a caption..."
              value={postData.caption}
              onChangeText={caption => updatePostData('caption', caption)}
              theme={theme}
              size="medium"
              fullWidth
              containerStyle={{ marginTop: 16 }}
              maxLength={500}
            />

            {/* Authenticity Verification Banner - TEXT TAB */}
            <View style={[styles.verificationBanner, { backgroundColor: '#1F2937' }]}>
              <Icons.Verify size={20} color="#FF5C02" />
              <View style={styles.verificationText}>
                <Text size={13} weight="600" style={{ color: '#fff' }}>
                  Authenticity Verification
                </Text>
                <Text size={11} style={{ color: '#94a3b8', marginTop: 2 }}>
                  Your content will be scanned for authenticity before publishing
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Image Tab */}
        {activeTab === 'image' && (
          <View>
            {/* Image Upload Zone */}
            {hasImages ? (
              <View>
                {/* Image Grid */}
                <FlatList
                  data={postData.selectedImages}
                  renderItem={renderImageItem}
                  keyExtractor={item => item.id}
                  numColumns={3}
                  scrollEnabled={false}
                  contentContainerStyle={styles.imageGrid}
                  ListHeaderComponent={
                    <View style={styles.imageCountHeader}>
                      <Text size={14} style={{ color: '#A855F7' }}>
                        {imageCount} {imageCount === 1 ? 'image' : 'images'} selected
                      </Text>
                      <Text size={12} style={{ color: '#94a3b8', marginTop: 2 }}>
                        Max 20 images
                      </Text>
                    </View>
                  }
                />
                
                {/* Add More Images Button */}
                {imageCount < 20 && (
                  <TouchableOpacity
                    style={[
                      styles.addMoreButton,
                      {
                        backgroundColor: '#111827',
                        borderColor: '#A855F7',
                      },
                    ]}
                    onPress={pickImages}
                  >
                    <Icons.Upload size={20} color="#A855F7" />
                    <Text size={14} weight="600" style={{ marginLeft: 8, color: '#A855F7' }}>
                      Add more photos
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.emptyState,
                  {
                    backgroundColor: '#111827',
                    borderColor: errors.image ? '#FF5C02' : '#A855F7',
                    borderStyle: 'dashed',
                  },
                ]}
                onPress={pickImages}
              >
                <Icons.Upload size={48} color="#A855F7" />
                <Text
                  size={16}
                  weight="600"
                  style={{ marginTop: 12, color: '#fff' }}
                >
                  Tap to add photos
                </Text>
                <Text
                  size={13}
                  style={{ marginTop: 6, color: '#94a3b8' }}
                >
                  Up to 20 files
                </Text>
              </TouchableOpacity>
            )}

            {/* Caption */}
            <Input
              label="Caption (optional)"
              placeholder="Add a caption..."
              value={postData.caption}
              onChangeText={caption => updatePostData('caption', caption)}
              theme={theme}
              size="medium"
              fullWidth
              containerStyle={{ marginTop: 24 }}
              maxLength={500}
            />

            {/* Authenticity Verification Banner - IMAGE TAB */}
            <View style={[styles.verificationBanner, { backgroundColor: '#111827' }]}>
              <Icons.Verify size={20} color="#FF5C02" />
              <View style={styles.verificationText}>
                <Text size={13} weight="600" style={{ color: '#fff' }}>
                  Authenticity Verification
                </Text>
                <Text size={11} style={{ color: '#94a3b8', marginTop: 2 }}>
                  Your images will be scanned for authenticity before publishing
                </Text>
              </View>
            </View>

            {errors.image && (
              <Text size={12} style={{ marginTop: 8, color: '#FF5C02' }}>
                {errors.image}
              </Text>
            )}
          </View>
        )}

        {/* Video Tab */}
        {activeTab === 'video' && (
          <View>
            {postData.mediaUri ? (
              <View>
                <View
                  style={[
                    styles.videoContainer,
                    { borderColor: '#333333' },
                  ]}
                >
                  <Image
                    source={{ uri: postData.mediaThumbnail || postData.mediaUri }}
                    style={styles.videoThumbnail}
                  />
                  <View style={styles.playButton}>
                    <Text size={32} style={{ color: '#fff' }}>▶</Text>
                  </View>
                </View>
                <Button
                  type="outline"
                  size="medium"
                  fullWidth
                  onPress={pickVideo}
                  theme={theme}
                  style={{ marginVertical: 12, borderColor: '#A855F7' }}
                >
                  <Text size={14} weight="600" style={{ color: '#A855F7' }}>
                    Change Video
                  </Text>
                </Button>
              </View>
            ) : (
              <TouchableOpacity
                style={[
                  styles.emptyState,
                  {
                    backgroundColor: '#111827',
                    borderColor: errors.video ? '#FF5C02' : '#A855F7',
                  },
                ]}
                onPress={pickVideo}
              >
                <Icons.Upload size={48} color="#A855F7" />
                <Text
                  size={16}
                  weight="600"
                  style={{ marginTop: 12, color: '#fff' }}
                >
                  Tap to select a video
                </Text>
                <Text
                  size={13}
                  style={{ marginTop: 6, color: '#94a3b8' }}
                >
                  MP4 format recommended
                </Text>
              </TouchableOpacity>
            )}

            {/* Caption */}
            <Input
              label="Caption (optional)"
              placeholder="Add a caption..."
              value={postData.caption}
              onChangeText={caption => updatePostData('caption', caption)}
              theme={theme}
              size="medium"
              fullWidth
              containerStyle={{ marginTop: 16 }}
              maxLength={500}
            />

            {/* Authenticity Verification Banner - VIDEO TAB */}
            <View style={[styles.verificationBanner, { backgroundColor: '#111827' }]}>
              <Icons.Verify size={20} color="#FF5C02" />
              <View style={styles.verificationText}>
                <Text size={13} weight="600" style={{ color: '#fff' }}>
                  Authenticity Verification
                </Text>
                <Text size={11} style={{ color: '#94a3b8', marginTop: 2 }}>
                  Your video will be scanned for authenticity before publishing
                </Text>
              </View>
            </View>

            {errors.video && (
              <Text size={12} style={{ marginTop: 8, color: '#FF5C02' }}>
                {errors.video}
              </Text>
            )}
          </View>
        )}
      </ScrollView>

      {/* Primary Action Button */}
      <View style={[styles.footer, { backgroundColor: '#111827', borderTopColor: '#333333' }]}>
        <Button
          type="primary"
          size="large"
          fullWidth
          onPress={handleCreatePost}
          loading={loading}
          disabled={loading || 
            (activeTab === 'image' && !hasImages) ||
            (activeTab === 'video' && !postData.mediaUri) ||
            (activeTab === 'text' && !postData.text.trim())
          }
          style={{ 
            backgroundColor: '#1F2937',
            opacity: (
              loading || 
              (activeTab === 'image' && !hasImages) ||
              (activeTab === 'video' && !postData.mediaUri) ||
              (activeTab === 'text' && !postData.text.trim())
            ) ? 0.6 : 1
          }}
        >
          <Text size={16} weight="600" style={{ color: '#fff' }}>
            {loading ? 'Creating...' : 'Post & Verify'}
          </Text>
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabUnderline: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 3,
    borderRadius: 1.5,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 24,
  },
  textInput: {
    fontSize: 16,
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    minHeight: 200,
    textAlignVertical: 'top',
    fontFamily: 'Roboto',
  },
  charCount: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  emptyState: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoContainer: {
    width: '100%',
    aspectRatio: 16 / 9,
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    marginBottom: 12,
    position: 'relative',
  },
  videoThumbnail: {
    width: '100%',
    height: '100%',
  },
  playButton: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  // New styles for image tab
  imageGrid: {
    paddingTop: 12,
  },
  imageCountHeader: {
    marginBottom: 12,
    alignItems: 'center',
  },
  imageItemContainer: {
    position: 'relative',
    width: '31%', // 3 columns with spacing
    aspectRatio: 1,
    margin: '1%',
    borderRadius: 8,
    overflow: 'hidden',
  },
  imageItem: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  addMoreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: 'dashed',
    marginTop: 16,
  },
  verificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginTop: 24,
    borderWidth: 1,
    borderColor: '#333333',
  },
  verificationText: {
    flex: 1,
    marginLeft: 12,
  },
});