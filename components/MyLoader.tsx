import React from 'react';
import ContentLoader, { Circle, Rect } from 'react-content-loader/native';
import { View } from 'react-native';

const MyLoader = (props: any) => (
  <View style={{ height: '50%', marginTop: 20 }}>
    <ContentLoader
      speed={2}
      width={400}
      height={460}
      viewBox="0 0 400 460"
      backgroundColor="#f3f3f3"
      foregroundColor="#ecebeb"
      {...props}>
      <Circle cx="31" cy="31" r="15" />
      <Rect x="58" y="18" rx="2" ry="2" width="140" height="10" />
      <Rect x="58" y="34" rx="2" ry="2" width="140" height="10" />
      <Rect x="0" y="60" rx="2" ry="2" width="400" height="400" />
    </ContentLoader>
  </View>
);

export default MyLoader;
