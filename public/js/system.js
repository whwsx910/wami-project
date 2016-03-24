$(document).ready(function() {
    $('#startSAW').click(function() {
        if ($('#SAW_rewardNumber').val() > 0) {
            $.ajax({
                type: "POST",
                url: "/events/startSAW",
                data: {
                    SAW_rewardNumber: $('#SAW_rewardNumber').val()
                },
                success: function(data) {
                    $('#sawModal').modal('hide');
                    alert('New Shake and Win started!');
                }
            });
        }
    });
});