import React from 'react';
import { Redirect } from 'expo-router';
import { View, ActivityIndicator } from 'react-native';

export default function AddFoodAlias() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }} testID="alias-add-food-loading">
      <ActivityIndicator size="large" />
      <Redirect href="/add-food" />
    </View>
  );
}
