import { StyleSheet } from 'react-native';

const borderWidth = 0;
const margin = 1;
const maxContainerHeight = 100;
const Styles = StyleSheet.create({
  container: {
    alignItems: 'flex-start',
    alignSelf: 'flex-start',
    borderWidth,
    backgroundColor:'red'
  },
  containerRTL: {
    alignItems: 'flex-start',
    alignSelf: 'flex-end',
    borderWidth,
    margin,
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop:3,
  },
});

export default Styles;
export { borderWidth, margin };
