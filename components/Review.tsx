import { useQuery } from 'convex/react';
import { useCallback, useState } from 'react';
import { TouchableOpacity, View } from 'react-native';
import { Rating } from 'react-native-ratings';
import { RFPercentage } from 'react-native-responsive-fontsize';

import { ReviewModal } from '~/components/Dialogs/ReviewModal';
import { HStack } from '~/components/HStack';
import { RatingPercentage } from '~/components/RatingPercentage';
import { ReviewComments } from '~/components/ReviewComments';
import { MyText } from '~/components/Ui/MyText';
import { colors } from '~/constants/Colors';
import { api } from '~/convex/_generated/api';
import { Id } from '~/convex/_generated/dataModel';
import { calculateRatingStats } from '~/lib/helper';

type ReviewProps = {
  userId: Id<'users'>;
  organizationId: Id<'organizations'>;
  show?: boolean;
  showComments?: boolean;
};
type RatingCounts = {
  [K in 1 | 2 | 3 | 4 | 5]: number;
};
export const Review = ({ organizationId, userId, show, showComments }: ReviewProps) => {
  const [visible, setVisible] = useState(false);
  const onClose = useCallback(() => setVisible(false), []);
  const reviews = useQuery(api.reviews.fetchReviews, { organizationId });
  if (reviews === undefined) return null;
  if (reviews.length === 0) return null;
  const counts: RatingCounts = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
  };

  // Count occurrences of each rating
  reviews.forEach((review) => {
    // @ts-ignore
    counts[review?.rating] += 1;
  });
  const reviewsData = [
    { stars: 5, count: counts[5] },
    { stars: 4, count: counts[4] },
    { stars: 3, count: counts[3] },
    { stars: 2, count: counts[2] },
    { stars: 1, count: counts[1] },
  ];
  const { averageRating, ratingPercentages, totalRatings } = calculateRatingStats(reviewsData);
  return (
    <View>
      <ReviewModal
        visible={visible}
        onClose={onClose}
        organizationId={organizationId}
        userId={userId}
      />
      <HStack justifyContent="space-between">
        <MyText poppins="Medium" fontSize={15}>
          Reviews and Ratings
        </MyText>
        {show && (
          <TouchableOpacity onPress={() => setVisible(true)}>
            <MyText poppins="Medium" fontSize={15} style={{ color: colors.dialPad }}>
              Write a review
            </MyText>
          </TouchableOpacity>
        )}
      </HStack>
      <MyText
        poppins="Bold"
        fontSize={RFPercentage(2.4)}
        style={{ textAlign: 'center', marginVertical: 10 }}>
        {averageRating} out of 5.0
      </MyText>
      <Rating ratingCount={5} startingValue={averageRating} imageSize={20} readonly />
      <MyText
        poppins="Light"
        fontSize={RFPercentage(1.6)}
        style={{ textAlign: 'center', marginVertical: 10 }}>
        ({totalRatings} Reviews)
      </MyText>
      <RatingPercentage data={ratingPercentages} />
      {showComments && <ReviewComments organizationId={organizationId} />}
    </View>
  );
};
