import React from 'react';
import { TouchableOpacity, TouchableOpacityProps, StyleProp, ViewStyle, GestureResponderEvent } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring, withTiming } from 'react-native-reanimated';

interface AnimatedPressableProps extends Omit<TouchableOpacityProps, 'onPressIn' | 'onPressOut'> {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  scaleTo?: number;
}

export default function AnimatedPressable({ children, style, scaleTo = 0.95, onPress, ...rest }: AnimatedPressableProps) {
  const scale   = useSharedValue(1);
  const opacity = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value   = withSpring(scaleTo, { damping: 10, stiffness: 200 });
    opacity.value = withTiming(0.7, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value   = withSpring(1, { damping: 10, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 150 });
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        {...rest}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
}
