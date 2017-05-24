const parrotRus = (num) => {
  num = Math.abs(num);
  num %= 100;
  if (num >= 5 && num <= 20) {
    return 'попугаев';
  }
  num %= 10;
  if (num === 1) {
    return 'попугай';
  }
  if (num >= 2 && num <= 4) {
    return 'попугая';
  }
  return 'попугаев';
};


const socket = io.connect();
socket.on('parrot count', function(data) {
  $('.parrots__count').numerator({
    toValue: data,
  })
  $('.parrots__word').text(parrotRus(data));
});




$(document).ready(function() {

  $('#login').submit(function(e) {
    e.preventDefault();
    const username = $('#username').val().toLowerCase();
    const password = $('#password').val().toLowerCase();
    if (username === '' || password === '') {
      $('input[type="text"],input[type="password"]').css('border', '1px solid #ea8282');
      $('input[type="text"],input[type="password"]').css('box-shadow', '0 0 3px #ea8282');
    } else {
      $.post('/login', { name: username, password: password },
        function(data) {
          if (data.status === 400) {
            $('.login__status').text(data.message);
          }
          if (data.status === 200) {
            document.location.href = '/home';
          }
        });
    }
  });

  $('#tabs').tabs();

  $('.messages__list').on('click', 'a.messages__button-edit', function(e) {
    e.preventDefault();

    const $this = $(this);
    const item = $this.closest('.messages__item');
    const input = item.find('input');
    const textarea = item.find('textarea');
    const check = item.find('.messages__button-check');
    $this.css('display', 'none');
    check.css('display', 'block');
    input.attr('disabled', false);
    textarea.attr('disabled', false);
  });

  $('.messages__list').on('click', 'a.messages__button-check', function(e) {
    e.preventDefault();

    const $this = $(this);
    const itemId = $this.data('item-id');
    const item = $this.closest('.messages__item');
    const input = item.find('input');
    const textarea = item.find('textarea');
    const edit = item.find('.messages__button-edit');
    $this.css('display', 'none');
    edit.css('display', 'block');
    input.attr('disabled', true);
    textarea.attr('disabled', true);

    const message = {
      id: itemId,
      params: {
        user_message: input.val().toUpperCase(),
        bot_message: textarea.val(),
      },
    };

    $.ajax({
      type: 'POST',
      url: '/api/editBotMessage',
      data: JSON.stringify(message),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function(data) {
        const user = item.find('span.edited-name');
        user.text(data.user);
      },
      failure: function(errMsg) {
        console.log(errMsg);
      },
    });
  });

  $('.messages__list').on('click', 'a.messages__button-del', function(e) {
    e.preventDefault();
    const $this = $(this);
    const item = $this.closest('.messages__item');
    const itemId = $this.data('item-id');

    const confirmRemove = confirm('Вы точно хотите удалить?');
    if (confirmRemove) {
      const message = {
        id: itemId,
      };

      $.ajax({
        type: 'POST',
        url: '/api/removeBotMessage',
        data: JSON.stringify(message),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(data) {
          item.remove();
        },
        failure: function(errMsg) {
          console.log(errMsg);
        },
      });
    }
  });

  $('.messages__add button').on('click', function(e) {
    e.preventDefault();
    const $this = $(this);
    const modalDialog = $('.modal');
    $('body').css('overflow', 'hidden');
    modalDialog.css({
      display: 'block',
    });
  });

  $('.modal').on('click', function(e) {
    if (e.target === this) {
      $(this).css('display', 'none');

      $(this).find('input').val('');
      $(this).find('textarea').val('');
      $('body').css('overflow', '');
    }
  });

  $('a.modal__close').on('click', function(e) {
    e.preventDefault();
    if (e.target) {
      const modal = $('.modal');

      modal.css('display', 'none');
      modal.find('input').val('');
      modal.find('textarea').val('');
      $('body').css('overflow', '');
    }
  });

  const addNewMessage = function(data) {
    const template = `
      <div class="messages__item">
        <div class="messages__item-input">
          <input class="input messages__input" disabled="" value="${data.user_message}">
          <div class="last_edited">
            <span>Last edited by</span>
            <span class="edited-name">${data.last_edited}</span>
          </div>
        </div>
        <textarea class="textarea messages__textarea" disabled="">${data.bot_message}</textarea>
        <div class="messages__buttons">
          <a class="messages__button-edit" href="#" data-item-id="${data._id}">
            <i class="fa fa-pencil"></i>
          </a>
          <a class="messages__button-check" href="#" data-item-id="${data._id}">
            <i class="fa fa-check"></i>
          </a>
          <a class="messages__button-del" href="#" data-item-id="${data._id}">
            <i class="fa fa-trash"></i>
          </a>
        </div>
      </div>`;
    $('.messages__list').append(template);
  };

  $('#save_message').submit(function(e) {
    e.preventDefault();
    const userMessage = $('#user_message');
    const botMessage = $('#bot_message');

    if (userMessage.val() === '' || botMessage.val() === '') {
      $('#user_message, #bot_message').css('border', '1px solid #ea8282');
      $('#user_message, #bot_message').css('box-shadow', '0 0 3px #ea8282');
    } else {
      const message = {
        user_message: userMessage.val().toUpperCase(),
        bot_message: botMessage.val(),
      };

      $.ajax({
        type: 'POST',
        url: '/api/addBotMessage',
        data: JSON.stringify(message),
        contentType: 'application/json; charset=utf-8',
        dataType: 'json',
        success: function(data) {
          addNewMessage(data.data);
          $('.modal').css('display', 'none');
          userMessage.val('');
          botMessage.val('');
          $('body').css('overflow', '');
        },
        failure: function(errMsg) {
          console.log(errMsg);
        },
      });
    }
  });

  $('.settings__save button').on('click', function(e) {
    e.preventDefault();
    const $this = $(this);
    const botId = $this.data('bot-id');

    const userJoinActive = $('#join_active').is(':checked');
    const userJoinText = $('#user_join').val();

    const userLeaveActive = $('#leave_active').is(':checked');
    const userLeaveText = $('#user_leave').val();

    const message = {
      id: botId,
      params: {
        user_join: {
          active: userJoinActive,
          message: userJoinText,
        },
        user_leave: {
          active: userLeaveActive,
          message: userLeaveText,
        },
      },
    };

    $.ajax({
      type: 'POST',
      url: '/api/editBotSettings',
      data: JSON.stringify(message),
      contentType: 'application/json; charset=utf-8',
      dataType: 'json',
      success: function(data) {
        $('.settings__message').text('Сохранено');
        $('.settings__message').fadeOut(2000, function() {
          $('.settings__message').remove();
        });
      },
      failure: function(errMsg) {
        console.log(errMsg);
      },
    });
  });

  var form = document.forms.namedItem("addSticker");
  form.addEventListener('submit', function(ev) {

    var oData = new FormData(form);


    var oReq = new XMLHttpRequest();
    oReq.open("POST", "/api/addSticker", true);
    oReq.onload = function(oEvent) {
      if (oReq.status == 200) {
        document.getElementById("save_emoji").reset();
      } else {
        console.log(oReq.status);
      }
    };

    oReq.send(oData);
    ev.preventDefault();
  }, false);



});
