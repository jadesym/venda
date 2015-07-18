var ref = new Firebase("https://venda.firebaseio.com");

function Error(message) {
  $('#success').empty();
  $('#error').text(message);
}

var authId;
function authDataCallback(authData) {
  if (authData) {
  	authId = authData.uid;
    console.log("User " + authData.uid + " is logged in with " + authData.provider);
  } else {
    authId = null;
    console.log("User is no longer logged in!");
  }
}

ref.onAuth(authDataCallback);

function getAllBids() {
	if (authId !== null || authId !== undefined) {
		myBidsRef = ref.child('users').child(authId).child('myBids');
		var myBids;
		myBids.on('value', function(snapshot) {
			var keyList = Object.keys(snapshot.val);
			var idsToPrice = {};
			var bidsRef = ref.child('bids');
			keyList.forEach(function(keyId) {
				bidsRef.on(keyId, function(snapshot) {
					var price = Object.keys(snapshot.val())[0];
					idsToPrice[keyId] = price;
				}, function(error) {
					console.log("Could not get a specific item!");
				});
			});
			var ids = Object.keys(idsToPrice);
			var itemList = [];
			ids.forEach(function(id) {
				var price = idsToPrice[id];
				var item = getItemById(id);
				if (item[bidPrice] <= price) {
					item["bidStatus"] = "WINNING BID";
				} else {
					item["bidStatus"] = "NOT TOP BID";
				}
				itemList.push(item);
			});
			return itemList;
		}, function(error) {
			console.log('Could not get your items! ERROR')
			// Insert jquery for error logic
			return null;
		});
	} else {
		Error('You cannot get all your bids until you log in!')
	}


}

function getItemById(idForItem) {
	itemRef = ref.child('items').child(idForItem);
	var entireItem;
	itemRef.on("value", function (snapshot) {
		entireItem = snapshot.val();
		console.log(entireItem);
	}, function(error) {
		console.log("ERROR TRYING TO GET THE ITEM BY THAT ID!");
		return { error: "ERROR" };
	});
	// var imgUrls = entireItem.imgUrls;
	// var singleImgUrl;
	// for (firstObj in imgUrls) {
	// 	singleImgUrl = imgUrls.firstObj;
	// 	break;
	// }
	var relevantInfo;
	if (entireItem['status'] === "OPEN") {
		relevantInfo = {
			status: "OPEN",
			itemId: idForItem,
			closingTime: entireItem.closingTime,
			bidPrice: entireItem.currentBidPrice,
			itemName: entireItem.name,
			// imgUrl: singleImgUrl
		}
	} else if (entireItem['status']=== "ON HOLD") {
		relevantInfo = {
			status: "ON HOLD",
			itemId: idForItem,
			bidPrice: entireItem.currentBidPrice,
			itemName: entireItem.name,
			// imgUrl: singleImgUrl,
			meetupTime: entireItem.meetupTime,
			meetupLocation: entireItem.meetupLocation
		}
	} else {
		relevantInfo = {
			status: "COMPLETED",
			bidPrice: entireItem.currentBidPrice,
			itemName: entireItem.name,
			// imgUrl: singleImgUrl
		}
	}
	return relevantInfo;
}

function getAllItems() {
	if (authId !== null || authId !== undefined) {
		myItemsRef = ref.child('users').child(authId).child('myItems');
		var itemsList = [];
		myItemsRef.on('value', function(snapshot) {
			console.log(snapshot.val());
			var keyList = Object.keys(snapshot.val());
			console.log(keyList);
			keyList.forEach(function(keyId) {
				console.log(keyId);
				var item = getItemById(keyId);
				itemsList.push(item);
			});
			console.log(itemsList);
			return itemsList;

		}, function(error) {
			console.log('Could not get your items! ERROR')
			// Insert jquery for error logic
			return [];
		});
	} else {
		Error("You cannot get your items until you log in!");
	}
 
}