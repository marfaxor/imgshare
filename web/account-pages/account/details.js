

var accountData = {
  accountId : 0,
  displayName: ''
};


let storedAccountData = localStorage.getItem( 'accountData' );
if (
  storedAccountData
) {
  parsedAccountData = JSON.parse( storedAccountData );
  // todo check if valid
  accountData = parsedAccountData;
}

var imagePreviews = [];

var vueRoot = new Vue(
  {
    el: '#app-container',
    data: {
      imagePreviews: imagePreviews,
      accountData: accountData
    }
  }
);

//-----------------------------------------------this is setup to display admin info, need to make it dynamic for all users! --------------------------------
makeGetRequest('/account-details/admin')
.then(
  ( response ) => {
    let userdetails = JSON.parse(response);
    console.log( 'received response from server' );
    //debugging
    console.log(userdetails);
    document.getElementById('accountheader').innerHTML = userdetails.displayname;
    document.getElementById('user-bio').innerHTML = userdetails.bio;
    //testing

    for(var i=0; i<userdetails.images.length; i++){
      let imagePreview = userdetails.images[i];
      //debugging
      console.log(imagePreview.url);
      let urlParts = imagePreview.url.split( 'upload/' );
      imagePreview.thumbUrl = urlParts.join( 'upload/t_media_lib_thumb/' );
      imagePreviews.push( imagePreview );
    }

  } // response callback
);
