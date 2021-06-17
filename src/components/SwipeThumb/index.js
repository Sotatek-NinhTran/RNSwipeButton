import React, { useCallback, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { I18nManager } from 'react-native';
import {
  Animated,
  Image,
  PanResponder,
  TouchableNativeFeedback,
  View,
  ImageBackground
} from 'react-native';

// Styles
import styles, { borderWidth, margin } from './styles';

// Constants
import { TRANSPARENT_COLOR } from '../../constants';
import images from '@app/assets/images';
import { scale, vs } from 'react-native-size-matters';
const DEFAULT_ANIMATION_DURATION = 400;
const RESET_AFTER_SUCCESS_DEFAULT_DELAY = 1000;

const SwipeThumb = props => {
  // console.log('props',props)
  const [width, setWidth] = useState(30)
  const [size, setSize] = useState( {width:0,
    height:0})
    const [isBG, setIsBG] = useState(false)
    const [heightImg, setHeightImg] = useState(30)
  const paddingAndMarginsOffset = borderWidth + 2 * margin;
  const defaultContainerWidth = props.iconSize;
  const forceReset = props.forceReset;
  const maxWidth = props.layoutWidth - paddingAndMarginsOffset;
  const isRTL = I18nManager.isRTL;

  const animatedWidth = useRef(new Animated.Value(defaultContainerWidth))
    .current;
  const [defaultWidth, setDefaultWidth] = useState(defaultContainerWidth);
  const [shouldDisableTouch, disableTouch] = useState(false)

  const [backgroundColor, setBackgroundColor] = useState(TRANSPARENT_COLOR);
  const [borderColor, setBorderColor] = useState(TRANSPARENT_COLOR);

  const panResponder = useCallback(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onStartShouldSetPanResponderCapture: () => true,
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onShouldBlockNativeResponder: () => true,
      onPanResponderStart,
      onPanResponderMove,
      onPanResponderRelease,
    }),
    [props],
  );
  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: defaultWidth,
      duration: 400,
      useNativeDriver: false,
    }).start();
  }, [animatedWidth, defaultWidth]);

  useEffect(() => {
    forceReset && forceReset(reset);
  }, [forceReset]);

  function onSwipeNotMetSuccessThreshold() {
    setIsBG(false)
    // console.log('200')
    // Animate to initial position
    setDefaultWidth(defaultContainerWidth);
    props.onSwipeFail && props.onSwipeFail();
  }

  function onSwipeMetSuccessThreshold(newWidth) {
    // console.log('100')
    if (newWidth !== maxWidth) {
      finishRemainingSwipe();
      return;
    }
    invokeOnSwipeSuccess()
    reset();
  }

  function onPanResponderStart() {
    setSize({...size, width:vs(40), height:vs(40)})
    
    // console.log('789')
    if (props.disabled) {
      return;
    }
    props.onSwipeStart && props.onSwipeStart();
  }

  async function onPanResponderMove(event, gestureState) {
    setIsBG(true)
    // console.log('456')
    if (props.disabled) {
      return;
    }
    const reverseMultiplier = props.enableReverseSwipe ? -1 : 1;
    const rtlMultiplier = isRTL ? -1 : 1;
    const newWidth =
      defaultContainerWidth +
      rtlMultiplier * reverseMultiplier * gestureState.dx;
    if (newWidth < defaultContainerWidth) {
      // Reached starting position
      reset();
    } else if (newWidth > maxWidth) {
      // Reached end position
      setBackgroundColors();
      setDefaultWidth(maxWidth);
    } else {
      setBackgroundColors();
      await Animated.timing(animatedWidth, {
        toValue: newWidth,
        duration: 0,
        useNativeDriver: false,
      }).start();
      setDefaultWidth(newWidth);
    }
  }

  function onPanResponderRelease(event, gestureState) {
    setSize({...size, width:0, height:0})
    // console.log("123")
    if (props.disabled) {
      return;
    }
    const reverseMultiplier = props.enableReverseSwipe ? -1 : 1;
    const rtlMultiplier = isRTL ? -1 : 1;
    const newWidth =
      defaultContainerWidth +
      rtlMultiplier * reverseMultiplier * gestureState.dx;
    const successThresholdWidth =
      maxWidth * (props.swipeSuccessThreshold / 100);
    newWidth < successThresholdWidth
      ? onSwipeNotMetSuccessThreshold()
      : onSwipeMetSuccessThreshold(newWidth);
  }

  function setBackgroundColors() {
    const { railFillBackgroundColor, railFillBorderColor } = props;
    // Set backgroundColor only if not already set
    if (backgroundColor === TRANSPARENT_COLOR) {
      setBackgroundColor(railFillBackgroundColor);
      setBorderColor(railFillBorderColor);
    }
  }

  function finishRemainingSwipe() {
    // Animate to final position
    setDefaultWidth(maxWidth);
    invokeOnSwipeSuccess()

    //Animate back to initial position after successfully swiped
    const resetDelay =
      DEFAULT_ANIMATION_DURATION +
      (props.resetAfterSuccessAnimDelay !== undefined
        ? props.resetAfterSuccessAnimDelay
        : RESET_AFTER_SUCCESS_DEFAULT_DELAY);
    setTimeout(() => {
      props.shouldResetAfterSuccess && reset();
    }, resetDelay);
  }

  function invokeOnSwipeSuccess() {
    disableTouch(props.disableResetOnTap)
    props.onSwipeSuccess && props.onSwipeSuccess();
  }

  function reset() {
    disableTouch(false)
    setDefaultWidth(defaultContainerWidth);

    if (backgroundColor !== TRANSPARENT_COLOR) {
      setBackgroundColor(TRANSPARENT_COLOR);
      setBorderColor(TRANSPARENT_COLOR);
    }
  }

  function renderThumbIcon() {
    const {
      disabled,
      disabledThumbIconBackgroundColor,
      disabledThumbIconBorderColor,
      iconSize,
      thumbIconBackgroundColor,
      thumbIconBorderColor,
      thumbIconComponent: ThumbIconComponent,
      thumbIconImageSource,
      thumbIconStyles,
    } = props;
    const dynamicStyles = {
      ...thumbIconStyles,
      height: iconSize,
      width: iconSize,
      // backgroundColor: disabled
      //   ? disabledThumbIconBackgroundColor
      //   : thumbIconBackgroundColor,
      // borderColor: disabled
      //   ? disabledThumbIconBorderColor
      //   : thumbIconBorderColor,
      borderColor: 'transparent',
      overflow: 'hidden',
    };

    return (
      <View style={[styles.icon, { ...dynamicStyles }]}>
        {!ThumbIconComponent && thumbIconImageSource && (
          <Image
            style={size.width !== 0 ? size:{width:vs(40), height:vs(40)}}
            resizeMode="contain"
            resizeMethod="auto" source={thumbIconImageSource} />
          )}
        {ThumbIconComponent && (
          <View>
            <ThumbIconComponent />
          </View>
        )}
      </View>
    );
  }

  const {
    disabled,
    enableReverseSwipe,
    onSwipeSuccess,
    railStyles,
    screenReaderEnabled,
    title,
    backgroundImageSource
  } = props;

  const panStyle = {
    backgroundColor,
    borderColor,
    width: animatedWidth,
    ...(enableReverseSwipe ? styles.containerRTL : styles.container),
    ...railStyles,
  };
  var AnimatedImage = Animated.createAnimatedComponent(ImageBackground)
  // console.log('widtf', width)
  return (
    <>
      {screenReaderEnabled ? (
        <TouchableNativeFeedback
          accessibilityLabel={`${title}. ${
            disabled ? 'Disabled' : 'Double-tap to activate'
          }`}
          disabled={disabled}
          onPress={onSwipeSuccess}
          accessible>
         
           {/* {renderThumbIcon()} */}
        </TouchableNativeFeedback>
      ) : (
        <Animated.View  
          onLayout={e=>{setWidth(e.nativeEvent.layout.width)}}
          style={[panStyle]} 
          {...panResponder.panHandlers}
          pointerEvents= {shouldDisableTouch ? "none" : "auto"}
        >
          {isBG ? (
            <ImageBackground  
              resizeMode= {width<166?"stretch":'cover'}
              resizeMethod="auto"
              source={backgroundImageSource} 
              style={[{
                width: width, 
                alignItems: 'flex-end',
                justifyContent: 'center',
                height: vs(38),
                overflow: 'hidden'
              }]}
            >
              {renderThumbIcon()}
            </ImageBackground>
          )
          : renderThumbIcon()}
        </Animated.View>
      )}
    </>
  );
};

SwipeThumb.defaultProps = {
  disabled: false,
  layoutWidth: 0,
  resetAfterSuccessAnimDuration: 200,
  disableResetOnTap: false,
  screenReaderEnabled: false,
  thumbIconStyles: {},
};

SwipeThumb.propTypes = {
  disabled: PropTypes.bool,
  disableResetOnTap: PropTypes.bool,
  disabledThumbIconBackgroundColor: PropTypes.string,
  disabledThumbIconBorderColor: PropTypes.string,
  enableReverseSwipe: PropTypes.bool,
  forceReset: PropTypes.func,
  iconSize: PropTypes.number,
  layoutWidth: PropTypes.number,
  onSwipeFail: PropTypes.func,
  onSwipeStart: PropTypes.func,
  onSwipeSuccess: PropTypes.func,
  railFillBackgroundColor: PropTypes.string,
  railFillBorderColor: PropTypes.string,
  railStyles: PropTypes.object,
  resetAfterSuccessAnimDuration: PropTypes.number,
  screenReaderEnabled: PropTypes.bool,
  shouldResetAfterSuccess: PropTypes.bool,
  swipeSuccessThreshold: PropTypes.number,
  thumbIconBackgroundColor: PropTypes.string,
  thumbIconBorderColor: PropTypes.string,
  thumbIconComponent: PropTypes.oneOfType([
    PropTypes.element,
    PropTypes.node,
    PropTypes.func,
  ]),
  thumbIconImageSource: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  backgroundImageSource: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  thumbIconStyles: PropTypes.object,
  title: PropTypes.string,
};

export default SwipeThumb;
