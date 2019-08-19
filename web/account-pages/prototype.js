
var imagePreviews = [
];


var guestAccount = {
  id: 0
};

var testAccount = {
  id: 3,
  accountInfo: {
    displayName: 'Test User'
  }
};
var account = testAccount;

/*/
Vue.component(
  'account-widget',
  {
    props: {
      account: {
        id: Number,
        displayName: String
      }
    },
    template: `
    `
  }
);
//*/


var vueRoot = new Vue(
  {
    el: '#app-container',
    data: {
      imagePreviews: imagePreviews,
      account: account
    }
  }
);

