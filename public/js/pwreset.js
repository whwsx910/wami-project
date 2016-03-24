function resetpw() {
  if ($('#password').val() === '') {
    $('#errorMsg').html('Invalid password!');
    $('#errorAlert').removeClass('hidden');
  }
  else if ($('#password').val() !== $('#password2').val()) {
    $('#errorMsg').html("Passwords don't match");
    $('#errorAlert').removeClass('hidden');
  }
  else {
    $.post("/users/resetpw", {
        UID: getParameterByName('UID'),
        password: $('#password').val()
      })
      .done(function(data) {
        if (data.success) {
          window.location.replace("/vip");
        }
      });
  }
}
