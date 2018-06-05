define(['jquery', 'core/ajax', 'mod_classroom/simplepeer', 'mod_classroom/canvasdraw'], function($, ajax, SimplePeer, CanvasDraw) {

    var is_initiated = false;
    var is_role_checked = false;
    var is_student = false;

    var peer_connections = [];
    var webcam_stream = null;
    var canvas_stream = null;

    var initiated_check_interval;

    // from init only
    function check_role(){

      var classroom_id = getQueryParam('id');
      var promises = ajax.call([
        { methodname: 'mod_classroom_is_teacher', args: { 'classroom_id': classroom_id } }
      ]);

      promises[0].done(function(response){
        var json = JSON.parse(response);
        if( json.status == 'success' ){

            is_role_checked = true;
            is_student = !json.is_teacher;

            if( is_role_checked && !is_student ){
                enable_initiate_btn();
                enable_canvasclear_btn();
                CanvasDraw.init('.canvas');
                $('button.clear_canvas').click(function(){
                    CanvasDraw.clear();
                })
                return;
            }

            initiated_check_interval = setInterval(function(){

                check_initiated();

            }, 3000);

        }
      }).fail(function(ex){

      });

    }

    function check_initiated(){
        var classroom_id = getQueryParam('id');
        var promises = ajax.call([
          { methodname: 'mod_classroom_is_initiated', args: { 'classroom_id': classroom_id } }
        ]);

        promises[0].done(function(response){
          var json = JSON.parse(response);
          if( json.status == 'success' ){

              if( json.is_initiated != undefined ){
                  is_initiated = true;
              }

              if( is_initiated ){
                  clearInterval(initiated_check_interval);
              }

              if( is_role_checked && is_student && is_initiated ){
                  enable_join_btn();
              }

          }
        }).fail(function(ex){

        });
    }

    function enable_initiate_btn(){
        var initiate_btn = $('button.btn-initiate');
        initiate_btn.prop('disabled', false);
        initiate_btn.show();
    }

    function enable_join_btn(){
        var join_btn = $('button.btn-join');
        join_btn.prop('disabled', false);
        join_btn.show();
    }

    function enable_canvasclear_btn(){
        var canvasclear_btn = $('button.clear_canvas');
        canvasclear_btn.prop('disabled', false);
        canvasclear_btn.show();
    }

    /**
     *  Returns a query parameter value
     */
    function getQueryParam(param){
        var url_string = window.location.href;
        var url = new URL(url_string);
        var c = url.searchParams.get(param);
        return c;
    }

    function initiate(){
      // check role -> if student
      if( is_student ){
        console.log('Student cannot initiate a connection');
        return;
      }

      // get stream
      navigator.getUserMedia({ video: true, audio: true }, function(stream){
          webcam_stream = stream;

          // set video
          var video = document.querySelector('.webcam_stream');
          video.src = window.URL.createObjectURL(stream);
          video.muted = true;
          video.play();

          // get canvas stream
          var canvasElem = document.querySelector('.canvas');
          var canvasStream = canvasElem.captureStream(25);
          canvas_stream = canvasStream;

          create_new_inititor_peer_connection();

      }, function () {});

    }

    function join(){
      // check role -> if student
      if( !is_student ){
        console.log('Teacher cannot join a connection');
        return;
      }

      connect_with_initiator(function(response){
          $('button.btn-join').hide();

          connect_with_learners(function(response){
              create_new_inititor_peer_connection(true);
          });


      });


    }

    function connect_with_initiator(callback){
        connect_with_an_offer(true, callback);
    }

    function connect_with_learners(callback){
        connect_with_an_offer(false, callback);
    }

    function connect_with_an_offer(with_initiator, callback){
        var offer_id;
        var peer1 = new SimplePeer({ trickle: false });
        peer1.on('error', function (err) { console.log('error', err) });
        peer1.on('signal', function (data) {
            var classroom_id = getQueryParam('id');
            if( offer_id == undefined ){
                console.error('Need offer id to set answer!');
                return;
            }

            var data = {
                'classroom_id': classroom_id,
                'offer_id': offer_id,
                'answer': JSON.stringify(data)
            }

            // send answer
            set_answer(data, callback);

        });
        peer1.on('connect', function () {
            console.log('CONNECT');
            // set user
             // $('.chat').append('<p><b style="color:green">Chat Connected!</b></p>');
             $('#public .messages').append('<p><b style="color:green">Chat Connected with '+peer1.username+'!</b></p>');

             // add to chat
             var elem = '<div class="col-xs-6"><button type="button" class="btn btn-info btn-block enter-chat" data-username="'+peer1.username+'">'+peer1.firstname+' '+peer1.lastname+'</button></div>';
             $('.chat-users').append(elem);
        });
        peer1.on('data', function (data) {
          data = JSON.parse(new TextDecoder("utf-8").decode(data));
          console.log('data: ' + data)
          // $('.chat').append('<p><b style="color:red">Others</b>: ' + data + '</p>');
          var elem = '<li class="message left appeared"><img src="'+peer1.profilepic+'" class="avatar" /><div class="text_wrapper"><div class="text_user">'+peer1.firstname+' '+peer1.lastname+'</div><div class="text">'+data.msg+'</div></div></li>';
          if( data.type == 'public' ){
              $('#public .messages').append(elem);
          }else{
              var allMsgBoxes = $('#private ul');
              allMsgBoxes.each(function(index, element){
                  $(element).hide();
              })

              var username = peer1.username;
              $('#private_tab').text('Private Chat - '+username);
              $('#private_tab').attr('data-username', username);
              $('#private_tab').tab('show');

              var msgBoxes = $('#private').find('[data-username="'+username+'"]');
              if( msgBoxes.length > 0 ){
                $(msgBoxes[0]).show();
              }else{
                  var newElem = '<ul class="messages" data-username="'+username+'"></ul>';
                  $('#private').append(newElem);
              }

              var ulElem = $('#private').find('ul[data-username="'+username+'"]');
              if( ulElem.length > 0 ){
                  ulElem.append(elem);
              }
          }
        })
        peer1.on('stream', function (stream) {
          console.log(stream);
          if( with_initiator ){
              var video = document.querySelector('.webcam_stream');
              video.src = window.URL.createObjectURL(stream);
              // video.muted = true;
              video.play();
          }

          // if( webcam_stream == undefined ){
          //     getDummyStream();
          // }
          // $('.chat').append('<p><b style="color:red">Others</b>: ' + data + '</p>');
        })
        peer1.on('close', function(){
            if( with_initiator ){
                window.location.replace("/");
            }
        })

        peer_connections.push({ 'inititor': false, 'connection': peer1 });

        // get a lock
        if( with_initiator ){
            get_instructor_offer_lock(function(response){
                clearInterval(instructor_offer_poll_interval);
                instructor_offer_poll_interval = null;
                is_polling_for_instructor_offer = false;
                // get offer
                offer_id = response.offer_id;

                // set offer
                peer1.username = response.username;
                peer1.firstname = response.firstname;
                peer1.lastname = response.lastname;
                peer1.user_id = response.user_id;
                peer1.profilepic = response.profilepic;
                peer1.signal(response.offer);
            });
        }else{
            get_student_offer_lock(function(response){
                if( response.status == 'failed' ){
                    clearInterval(student_offer_poll_interval);
                    student_offer_poll_interval = null;
                    is_polling_for_student_offer = false;

                    if( callback != undefined ){
                        callback(response);
                    }
                }else{
                    // get offer
                    offer_id = response.offer_id;

                    // set offer
                    peer1.username = response.username;
                    peer1.firstname = response.firstname;
                    peer1.lastname = response.lastname;
                    peer1.user_id = response.user_id;
                    peer1.profilepic = response.profilepic;
                    peer1.signal(response.offer);
                }

            });
        }

    }

    function getDummyStream(){
      navigator.getUserMedia({ video: true, audio: true }, function(stream){
          webcam_stream = stream;

          // set video
          var video = document.querySelector('.webcam_stream');
          video.src = window.URL.createObjectURL(stream);
          video.muted = true;
          video.play();

      }, function () {});
    }

    var is_polling_for_instructor_offer = false;
    var instructor_offer_poll_interval;
    function get_instructor_offer_lock(callback){

        if( !is_polling_for_instructor_offer ){
          is_polling_for_instructor_offer = true;
          // to be replace with a more efficient method
          instructor_offer_poll_interval = setInterval(function(){

              var classroom_id = getQueryParam('id');
              var promises = ajax.call([
                { methodname: 'mod_classroom_get_instructor_offer_lock', args: { 'classroom_id': classroom_id } }
              ]);

              promises[0].done(function(response){
                var json = JSON.parse(response);
                if( json.status == 'success' && callback != undefined ){
                    callback(json);
                }
              }).fail(function(ex){

              });

          }, 3000);
        }
    }

    var is_polling_for_student_offer = false;
    var student_offer_poll_interval;
    function get_student_offer_lock(callback){

        if( !is_polling_for_student_offer ){
          is_polling_for_student_offer = true;
          // to be replace with a more efficient method
          student_offer_poll_interval = setInterval(function(){

              var classroom_id = getQueryParam('id');
              var promises = ajax.call([
                { methodname: 'mod_classroom_get_student_offer_lock', args: { 'classroom_id': classroom_id } }
              ]);

              promises[0].done(function(response){
                var json = JSON.parse(response);
                if( callback != undefined ){
                    callback(json);
                }
              }).fail(function(ex){

              });

          }, 3000);
        }
    }

    function set_offer(data, callback){
        var promises = ajax.call([
          { methodname: 'mod_classroom_set_offer', args: data }
        ]);

        promises[0].done(function(response){
          console.log(response);
          if( callback != undefined ){
              callback(response);
          }
        }).fail(function(ex){

        });
    }

    function set_answer(data, callback){
        var promises = ajax.call([
          { methodname: 'mod_classroom_set_answer', args: data }
        ]);

        promises[0].done(function(response){
          console.log(response);
          if( callback != undefined ){
              callback(response);
          }
        }).fail(function(ex){

        });
    }

    var isPolling = false;
    var pollInterval;
    function poll_answer(offerId, callback){
        if( offerId == undefined ){
            console.error('Cannot poll without offer id!');
            return;
        }

        if( !isPolling ){
          isPolling = true;
          // to be replace with a more efficient method
          pollInterval = setInterval(function(){

              var classroom_id = getQueryParam('id');
              var promises = ajax.call([
                { methodname: 'mod_classroom_get_answer', args: { 'classroom_id': classroom_id, 'offer_id': offerId } }
              ]);

              promises[0].done(function(response){
                var json = JSON.parse(response);
                if( json.status == 'success' && callback != undefined ){
                    callback(json);
                }
              }).fail(function(ex){

              });

          }, 3000);
        }
    }

    function create_new_inititor_peer_connection(is_student_initiator){

      if( is_student == undefined ){
        console.error('Cannot initiate connection without identifying user type!');
        return;
      }
      if( is_student_initiator == undefined ){
          is_student_initiator = false;
      }

      // create peer connection
      var  peer1;
      if( !is_student ){
          // peer1 = new SimplePeer({ initiator: true, streams: [ webcam_stream,  canvas_stream], trickle: false });
          peer1 = new SimplePeer({ initiator: true, stream: webcam_stream, trickle: false });
      }
      else if(is_student_initiator){
          peer1 = new SimplePeer({ initiator: true, trickle: false });
      }
      else{
          peer1 = new SimplePeer({ trickle: false });
      }

      peer1.on('error', function (err) { console.log('error', err) });
      peer1.on('signal', function (data) {
          var classroom_id = getQueryParam('id');
          var is_instructor = !is_student;
          var offer = data;
          var webcam_stream_id = ( !is_student && webcam_stream != undefined )? webcam_stream.id : null;

          var data = {
              'classroom_id': classroom_id,
              'is_instructor': is_instructor,
              'offer': JSON.stringify(offer),
              'webcam_stream_id': webcam_stream_id
          }

          set_offer(data, function(response){

              var offerResponseData = JSON.parse(response);
              var offerId = offerResponseData.offer_id;

              poll_answer(offerId, function(json){
                  clearInterval(pollInterval);
                  pollInterval = null;
                  isPolling = false;

                  console.log(peer1);
                  peer1.username = json.username;
                  peer1.firstname = json.firstname;
                  peer1.lastname = json.lastname;
                  peer1.user_id = json.user_id;
                  peer1.profilepic = json.profilepic;
                  peer1.signal(json.answer);

                  // teacher finish


                  $('button.btn-initiate').hide();
                  create_new_inititor_peer_connection();
                  // initiate(is_student);
              });
          });
      });
      peer1.on('connect', function () {
          console.log('CONNECT');
          // set user
           // $('.chat').append('<p><b style="color:green">Chat Connected!</b></p>');
           $('#public .messages').append('<p><b style="color:green">Chat Connected with '+peer1.username+'!</b></p>');

           // add to chat
           var elem = '<div class="col-xs-6"><button type="button" class="btn btn-info btn-block enter-chat" data-username="'+peer1.username+'">'+peer1.firstname+' '+peer1.lastname+'</button></div>';
           $('.chat-users').append(elem);
      });
      peer1.on('data', function (data) {
        data = JSON.parse(new TextDecoder("utf-8").decode(data));
        console.log('data: ' + data)
        // $('.chat').append('<p><b style="color:red">Others</b>: ' + data + '</p>');
        var elem = '<li class="message left appeared"><img src="'+peer1.profilepic+'" class="avatar" /><div class="text_wrapper"><div class="text_user">'+peer1.firstname+' '+peer1.lastname+'</div><div class="text">'+data.msg+'</div></div></li>';
        if( data.type == 'public' ){
            $('#public .messages').append(elem);
        }else{
            var allMsgBoxes = $('#private ul');
            allMsgBoxes.each(function(index, element){
                $(element).hide();
            })

            var username = peer1.username;
            $('#private_tab').text('Private Chat - '+username);
            $('#private_tab').attr('data-username', username);
            $('#private_tab').tab('show');

            var msgBoxes = $('#private').find('[data-username="'+username+'"]');
            if( msgBoxes.length > 0 ){
              $(msgBoxes[0]).show();
            }else{
                var newElem = '<ul class="messages" data-username="'+username+'"></ul>';
                $('#private').append(newElem);
            }

            var ulElem = $('#private').find('ul[data-username="'+username+'"]');
            if( ulElem.length > 0 ){
                ulElem.append(elem);
            }
        }
      })
      peer1.on('stream', function (stream) {
        console.log(stream)
        var video = document.querySelector('.webcam_stream');
        video.src = window.URL.createObjectURL(stream);
        // video.muted = true;
        video.play();
        if( webcam_stream == undefined ){
          // getDummyStream();
        }
        // $('.chat').append('<p><b style="color:red">Others</b>: ' + data + '</p>');
      })

      peer1.on('close', function(){
          window.location.replace("/");
      })

      peer_connections.push({ 'inititor': true, 'connection': peer1 });

    }

    function send_message(){
        var elem = $('.chat_input input[type="text"]');
        var msg = elem.val();

        var is_public_chat = is_public_chat_active();

        if( is_public_chat ){
            send_public_message(msg);
        }else{
            send_private_message(msg);
        }
        elem.val('');
        // peer1.send(data);
    }

    function send_public_message(msg){
        var elem = '<li class="message right appeared"><div class="avatar"></div><div class="text_wrapper"><div class="text">'+msg+'</div></div></li>';
        $('#public .messages').append(elem);
        peer_connections.forEach(function(item, index){
            if( item.connection.connected ){
                item.connection.send(JSON.stringify({'type': 'public', 'msg': msg}));
            }
        })
    }

    function send_private_message(msg){
        var elem = '<li class="message right appeared"><div class="avatar"></div><div class="text_wrapper"><div class="text">'+msg+'</div></div></li>';

        // username
        var username =   $('#private_tab').attr('data-username');
        var msgBoxes = $('#private').find('ul[data-username="'+username+'"]');
        if( msgBoxes.length > 0 ){
            $(msgBoxes[0]).append(elem);
        }

        peer_connections.forEach(function(item, index){
            if( item.connection.connected && item.connection.username == username ){
                item.connection.send(JSON.stringify({'type': 'private', 'msg': msg}));
            }
        })
    }

    function terminate_classroom(){

      var classroom_id = getQueryParam('id');
      var promises = ajax.call([
        { methodname: 'mod_classroom_terminate_classroom', args: { 'classroom_id': classroom_id } }
      ]);

      promises[0].done(function(response){
        var json = JSON.parse(response);
        if( json.status == 'success' ){

            window.location.replace("/");

        }else{
            alert('Error terminating the classroom!');
        }
      }).fail(function(ex){

      });
    }

    function is_public_chat_active(){
        return $('#public').hasClass('active');
    }

    return {
        init: function() {

            // Put whatever you like here. $ is available
            // to you as normal.
            $(".btn-primary").click(function() {
                //alert("It changed!!");
                console.log(SimplePeer);
            });

            check_role();

            $('button.btn-initiate').click(function(){
                initiate();
            })
            $('button.btn-join').click(function(){
                join();
            })

            $('.chat_input input[type="text"]').keypress(function(e) {
                if(e.which == 13) {
                    e.preventDefault();
                    // var data = $('textarea').val();
                    // $('.chat').append('<p><b>You</b>: ' + data + '</p>');
                    // $('textarea').val('');
                    // peer1.send(data);
                    send_message();
                }
            });
            $('button.btn-send').click(function(e){
                send_message();
            })

            // terminate
            $('.terminate').click(function(e){
                e.preventDefault();
                terminate_classroom();
            })

            $(document).on('click', 'button.enter-chat', function(e){
                var elem = $(e.currentTarget);

                var allMsgBoxes = $('#private ul');
                allMsgBoxes.each(function(index, element){
                    $(element).hide();
                })

                var username = elem.attr('data-username');
                $('#private_tab').text('Private Chat - '+username);
                $('#private_tab').attr('data-username', username);
                $('#private_tab').tab('show');

                var msgBoxes = $('#private').find('[data-username="'+username+'"]');
                if( msgBoxes.length > 0 ){
                  $(msgBoxes[0]).show();
                }else{
                    var newElem = '<ul class="messages" data-username="'+username+'"></ul>';
                    $('#private').append(newElem);
                }
            })

        }
    };
});
