/**
 * Channels: TV3, TV6, TV8, and all of the sports channels
 * Based on the tvse script for xot-uzg: http://code.google.com/p/xot-uzg/downloads/list
 */

(function(plugin) {

  plugin.createService("Viasat Play", "viastream:start", "tv", true,
		       plugin.path + "viaplay_square.png");


  function extractGeoblockUrl(url) {
      var doc = new XML(showtime.httpGet(url).toString());
      return doc.Url;
  }

  function getVerifiableVideoUrl(url) {
      return url + " swfurl=" + "http://flvplayer.viastream.viasat.tv/flvplayer/play/swf/player100920.swf swfvfy=true";
  }

  function startPage(page) {      
	  /**
	   * Sporting channels: 1se
	   * TV3: 2se
	   * TV6: 3se
	   * TV8: 4se
	   */
	  page.appendItem("viastream:sitemapdata:2se:0", "directory", {
		  title: "TV3",
		      icon: plugin.path + "2selarge.png"
		      });

	  page.appendItem("viastream:sitemapdata:3se:0", "directory", {
		  title: "TV6",
		      icon: plugin.path + "3selarge.png"
		      });

	  page.appendItem("viastream:sitemapdata:4se:0", "directory", {
		  title: "TV8",
		      icon: plugin.path + "4selarge.png"
		      });
	  
	  page.appendItem("viastream:sitemapdata:1se:0", "directory", {
		  title: "Sport",
		      icon: plugin.path + "1selarge.png"
		      });
	  

    page.type = "directory";
    page.contents = "items";
    page.loading = false;

    page.metadata.logo = plugin.path + "viasatimage.jpg";
    page.metadata.title = "Viasat Play"; 
  }

  plugin.addURI("viastream:products:([0-9,]*)", function(page, productsId) {
	  page.contents = "video";
	  page.type = "directory";

          var doc = new XML(showtime.httpGet("http://viastream.viasat.tv/Products/Category/" + productsId).toString());

	  for each (var productNode in doc.Product) {
		  //fetch info for each episode - one request per episode!
		  
	          var productDoc = new XML(showtime.httpGet("http://viastream.viasat.tv/Products/" + productNode.ProductId).toString());

		  var metadata = {
		      title: productNode.Title,
		      description: productDoc.Product.LongDescription,
		      icon: productDoc.Product.Images.ImageMedia.Url
		  };
		  
		  var url = productDoc.Product.Videos.Video.Url;
		  
		  var geoBlock = productDoc.Product.Geoblock;

		  if(geoBlock == "true") {
		      url = extractGeoblockUrl(url);
		  }

		  url = getVerifiableVideoUrl(url);

		  page.appendItem(url,"video", metadata); 
	      }
	  page.loading = false;
      });
    
  plugin.addURI("viastream:sitemapdata:([a-z0-9,]*):([0-9,]*)", function(page, channelId, id) {
	  
    var doc = new XML(showtime.httpGet("http://viastream.viasat.tv/siteMapData/se/" + channelId + "/" + id).toString());

    for each (var siteMapNode in doc.siteMapNode) {
	    if(siteMapNode.@children == "true") {
		page.appendItem("viastream:sitemapdata:" + channelId + ":" + siteMapNode.@id,
				"directory", {
				    title: siteMapNode.@title
					})
		    }
	    else {
		//go to show product
		page.appendItem("viastream:products:" + siteMapNode.@id,
				"directory", {
				    title: siteMapNode.@title
					})
				}
	    }
      				
    page.type = "directory";
    page.loading = false;

    var logoPath = plugin.path + channelId + "large.png";
    page.metadata.logo = logoPath
  });



  plugin.addURI("viastream:start", startPage);
})(this);
