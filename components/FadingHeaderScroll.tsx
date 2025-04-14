import type { PropsWithChildren } from 'react';
import { StyleSheet, ImageBackground, ImageSourcePropType } from 'react-native';
import Animated, {
    interpolate,
    useAnimatedRef,
    useAnimatedStyle,
    useScrollViewOffset,
} from 'react-native-reanimated';

import { ThemedView } from '@/components/ThemedView';
import { useBottomTabOverflow } from '@/components/ui/TabBarBackground';

const HEADER_HEIGHT = 250;

type Props = PropsWithChildren<{
    headerImage: ImageSourcePropType;
}>;

export default function FadingHeaderScrollView({
    children,
    headerImage,
}: Props) {
    const scrollRef = useAnimatedRef<Animated.ScrollView>();
    const scrollOffset = useScrollViewOffset(scrollRef);
    const bottom = useBottomTabOverflow();

    const headerAnimatedStyle = useAnimatedStyle(() => {
        return {
            opacity: interpolate(
                scrollOffset.value,
                [0, HEADER_HEIGHT / 2],
                [1, 0]
            ),
            transform: [
                {
                    translateY: interpolate(
                        scrollOffset.value,
                        [0, HEADER_HEIGHT],
                        [0, -HEADER_HEIGHT / 3]
                    ),
                },
                {
                    scale: interpolate(
                        scrollOffset.value,
                        [-HEADER_HEIGHT, 0, HEADER_HEIGHT],
                        [1.5, 1, 1]
                    ),
                },
            ],
        };
    });

    return (
        <ThemedView style={styles.container}>
            <Animated.ScrollView
                ref={scrollRef}
                scrollEventThrottle={16}
                scrollIndicatorInsets={{ bottom }}
                contentContainerStyle={{ paddingBottom: bottom }}>
                <Animated.View style={[styles.header, headerAnimatedStyle]}>
                    <ImageBackground
                        source={headerImage}
                        style={styles.headerImage}
                        resizeMode="cover"
                    />
                </Animated.View>
                <ThemedView style={styles.content}>{children}</ThemedView>
            </Animated.ScrollView>
        </ThemedView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        height: HEADER_HEIGHT,
        overflow: 'hidden',
    },
    headerImage: {
        width: '100%',
        height: '100%',
    },
    content: {
        flex: 1,
        padding: 32,
        gap: 16,
    },
});