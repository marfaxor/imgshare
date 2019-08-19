
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

function makeGetRequest(
  url
) {
  let promise = new Promise(
    function(
      resolve,
      reject
    ) {
      var request = new XMLHttpRequest();

      request.open(
        "GET",
        url
      );

      request.onload = function() {
        let status = this.status;

        if (
          status >= 200
          && status < 300
        ) {
          resolve(
            this.response
          );
        }
        else {
          reject(
            this.statusText
          );
        }
      }; // onload callback

      request.send();
    } // executor
  ); // promise

  return promise;
} // makeGetRequest
var imagePreviews = [];

var view = new Vue(
  {
    el: '#app-container',
    data: {
      imagePreviews: imagePreviews,
      accountData: accountData
    }
  }
);


makeGetRequest('/fp/')
.then(
  ( response ) => {
    // response might be text (a JSON string)
    // or it could be an object...
    // I was getting JSON strings even with
    // the headers set up to return JSON
    let fp_images = JSON.parse(response);
    console.log( 'received response from server' );
    //console.log(response);
    //testing
    //let tiles = document.getElementById('tiles');
    //tiles.innerHTML = '<hr></br>';
    for(var i=0; i<fp_images.images.length; i++){
      let imagePreview = fp_images.images[i];
      //https://res.cloudinary.com/hws6kskjw/image/upload/v1543265795/qwh3dlfeqygdtitheijg.jpg
      //https://res.cloudinary.com/hws6kskjw/image/upload/t_media_lib_thumb/v1543265795/qwh3dlfeqygdtitheijg.jpg
      let urlParts = imagePreview.url.split( 'upload/' );
      imagePreview.thumbUrl = urlParts.join( 'upload/t_media_lib_thumb/' );
      //  tiles.innerHTML += fp_images.images[i].url + '<br>';
      //  tiles.innerHTML += fp_images.images[i].uploaddate + '<br><br>';
      imagePreviews.push( imagePreview );
    }

  } // response callback
);

