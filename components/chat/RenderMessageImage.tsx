import * as FileSystem from 'expo-file-system';
import { router } from 'expo-router';
import React, { useState } from 'react';
import { Dimensions, StyleSheet, TouchableOpacity } from 'react-native';
import { IMessage, MessageImageProps } from 'react-native-gifted-chat';
import { toast } from 'sonner-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';

const { height: HEIGHT, width: WIDTH } = Dimensions.get('window');

export const RenderMessageImage = ({ ...props }: MessageImageProps<IMessage>) => {
  // const [visible, setVisible] = useState(false);
  const width = useSharedValue(200);
  const height = useSharedValue(300);
  console.log(props.currentMessage.image);
  const [isBig, setIsBig] = useState(false);
  const animatedStyle = useAnimatedStyle(() => ({
    width: width.value,
    height: height.value,
  }));
  const [downloading, setDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const callback = (p: any) => {
    const progress = p.totalBytesWritten / p.totalBytesExpectedToWrite;
    setDownloadProgress(progress);
  };
  const fileExt = new Date() + '.png';
  const downloadResumable = FileSystem.createDownloadResumable(
    props.currentMessage.image!,
    FileSystem.documentDirectory + fileExt,
    {},
    callback
  );
  const onDownload = async () => {
    try {
      const result = await downloadResumable.downloadAsync();
      console.log('Finished downloading to ', result);
    } catch (e) {
      console.error(e);
    }
  };

  const onPress = () => {
    setIsBig(true);
    if (isBig) {
      width.value = withSpring(200, { damping: 80, stiffness: 200 });
      height.value = withSpring(300, { damping: 80, stiffness: 200 });
      setIsBig(false);
    } else {
      width.value = withSpring(WIDTH, { damping: 80, stiffness: 200 });
      height.value = withSpring(HEIGHT, { damping: 80, stiffness: 200 });
    }
  };
  const onSave = async () => {
    setDownloading(true);
    try {
      await onDownload();

      toast.success('Image has been saved successfully');
    } catch (e) {
      console.log(e);
    } finally {
      setDownloading(false);
    }
  };
  return (
    <>
      <TouchableOpacity style={{ padding: 5 }} onPress={onPress}>
        <Animated.Image
          defaultSource={require('~/assets/images/pl.png')}
          source={{ uri: props.currentMessage?.image }}
          style={[{ borderRadius: 5, padding: 10 }, animatedStyle]}
          resizeMode="cover"
        />
      </TouchableOpacity>
      {/*<Modal*/}
      {/*  transparent*/}
      {/*  visible={visible}*/}
      {/*  onRequestClose={() => setVisible(false)}*/}
      {/*  style={{ height, width }}>*/}
      {/*  {closeBtn()}*/}

      {/*  <TouchableOpacity activeOpacity={1}>*/}
      {/*    <Image*/}
      {/*      placeholder={require('~/assets/images/pl.png')}*/}
      {/*      placeholderContentFit="cover"*/}
      {/*      source={{ uri: props.currentMessage.image }}*/}
      {/*      style={{ width: '100%', height: '100%' }}*/}
      {/*      contentFit="cover"*/}
      {/*    />*/}
      {/*  </TouchableOpacity>*/}
      {/*  {save()}*/}
      {/*</Modal>*/}
    </>
  );
};

const styles = StyleSheet.create({
  cancel: { position: 'absolute', left: 20, top: HEIGHT * 0.05, zIndex: 5 },
  download: { position: 'absolute', right: 20, bottom: 50, zIndex: 5 },
});
