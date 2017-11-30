import React from 'react';
import { Image, TouchableHighlight, Picker, TextInput, Button, StyleSheet, Text, View, FlatList } from 'react-native';
import * as firebase from 'firebase';
import { NavigationActions } from 'react-navigation'

import AuthService from './service/AuthService.js';
import OrderService from './service/OrderService.js';
import OrdererService from './service/OrdererService.js';

const _ = require('lodash');

const resetAction = NavigationActions.reset({
  index: 0,
  actions: [
    NavigationActions.navigate({ routeName: 'Delivery'})
  ]
})

export default class HomeScreen extends React.Component {
  static navigationOptions = ({ navigation, screenProps }) => ({
    title: "Home",
    headerLeft: null,
    headerRight: <Button title='Delivery Mode' onPress={() => navigation.dispatch(resetAction)} />
  });

  constructor() {
    super();
    this.authService = new AuthService();
    this.orderService = new OrderService();
    this.ordererService = new OrdererService();
    this.state = {
      cart: {
        1: {
          key: 1,
          title: 'Cups',
          imageUrl: require('./img/cupstxt1.png'),
          defaultQuantity: 10,
          pricePerDefaultQuantity: 2.99,
          quantityOrdered: 0,
        },
        2: {
          key: 2,
          title: 'Balls',
          imageUrl: require('./img/ballstxt1.png'),
          defaultQuantity: 2,
          pricePerDefaultQuantity: 2.99,
          quantityOrdered: 0,
        },
      },
      isOrderInProgress: false,
    }
  }

  // componentWillMount() {
  //   var uid = this.props.screenProps.user.providerData[0].uid;
  //   if(!_.isNull(uid)) {
  //     this.setState(_.merge({}, this.state, {
  //       ordererUid: uid
  //     }))
  //   }
  //
  //   var orderInProgress = this.ordererService.getOrderFromOrderer(uid);
  //   if (!_.isNull(orderInProgress)) {
  //     this.setState({
  //
  //     })
  //   }
  //   this.ordererService.ref.child(uid + '/order').on('value', (data) => {
  //     this.setState(())
  //   })
  // }
  //
  // componentWillUnmount() {
  //   this.ordererService.ref.child(uid + '/order').off();
  // }

  checkoutCart() {
    this.props.navigation.navigate('Confirm', {'user': this.props.screenProps.user, 'cart': this.state.cart})
  }

  delivery() {
    this.props.navigation.navigate('Delivery')
  }

  clearCart() {
    this.setState(_.merge({}, this.state, _.map(_.values(this.state.cart), (cartItem) => {
      cartItem.quantityOrdered = 0;
      return cartItem;
    })))
  }

  onPress(item) {
    var count = item.quantityOrdered;
    this.setState(_.merge({}, this.state, {
      cart: {
        [item.key]: {
          quantityOrdered: count + 1
        },
      }
    }))
  }

  render() {
    return this.renderHome();
  }

  renderInProgress() {
    return (
      <View style={styles.container}>
        <Text>Order is in progress</Text>
      </View>
    )
  }


  renderHome() {
    return (
      <View style={styles.container}>
        <Button
          style={styles.checkoutButton}
          onPress={() => {this.authService.signOut()}}
          title="Log out"
          color="#841584"
        />
        <Button
          style={styles.checkoutButton}
          onPress={() => {
            var order = {
              cart: this.state.cart,
              delivererId: null,
              ordererId: this.props.screenProps.user.providerData[0].uid
            }

            this.ordererService.addOrderToOrderer(order, this.props.screenProps.user.providerData[0].uid)
          }}
          title="Add Cart"
          color="#841584"
        />
        <FlatList
          contentContainerStyle={styles.feed}
          horizontal = {true}
          data = {_.values(this.state.cart)}
          renderItem={({item}) => {
            return (
              <View style={styles.itemButtonContainer}>
                <TouchableHighlight onPress={() => this.onPress(item)}>
                  <Image
                    style={styles.itemButton}
                    source={item.imageUrl}
                  />
                </TouchableHighlight>
              </View>
            )
          }}
        />
        <View style={styles.checkoutWrapper}>
          <View>
            <FlatList
              data = {_.values(this.state.cart)}
              renderItem={({item}) => {
                return (
                  <Text>
                    {item.title}: {item.quantityOrdered * item.defaultQuantity}
                  </Text>
                )
              }}
            />
          </View>

          <Button
            style={styles.checkoutButton}
            onPress={() => this.clearCart()}
            title="Clear Cart"
            color="#841584"
            accessibilityLabel="Clear Cart"
          />
          <Button
            style={styles.checkoutButton}
            disabled={_.sum(_.map(_.values(this.state.cart), 'quantityOrdered')) === 0}
            onPress={() => {this.checkoutCart()}}
            title="Checkout"
            color="#841584"
            accessibilityLabel="Checkout"
          />
        </View>
      </View>
	  )
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ebebeb',
  },
  feed: {
    alignItems: 'center',
  },
  itemButtonContainer: {
    alignItems: 'center',
    backgroundColor: '#66b4f3',

  },
  itemButton: {
    height: 200,
    width:200,
  },
  checkoutButton: {
  },
  checkoutWrapper: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 15,
  },
  submit:{
    // marginRight:70,
    // marginLeft:70,
    // marginTop:10,
    paddingTop:10,
    paddingBottom:10,
    paddingRight:10,
    paddingLeft:10,
    backgroundColor:'grey',
    borderRadius:10,
    borderWidth: 1,
    borderColor: '#fff'
  },
  submitText:{
      color:'#fff',
      textAlign:'center',
  }
});
