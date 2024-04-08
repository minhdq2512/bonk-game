var bullets = document.querySelectorAll('.container .bullet');
    var textItems = document.querySelectorAll('.container li');

    // Füge einen Eventlistener für alle Bullets hinzu
    bullets.forEach(function(bullet, index) {
        bullet.addEventListener('click', function() {
            // Entferne die aktive Klasse von allen Bullets
            bullets.forEach(function(item) {
                item.classList.remove('active');
            });
            // Füge die aktive Klasse nur dem geklickten Bullet Point hinzu
            this.classList.add('active');
        });
    });

    // Füge einen Eventlistener für alle Texte hinzu
    textItems.forEach(function(textItem, index) {
        textItem.addEventListener('click', function(event) {
            // Verhindere, dass das Klicken auf den Text das Standardverhalten auslöst
            event.stopPropagation();
            // Entferne die aktive Klasse von allen Bullets
            bullets.forEach(function(item) {
                item.classList.remove('active');
            });
            // Füge die aktive Klasse nur dem zugehörigen Bullet Point hinzu
            bullets[index].classList.add('active');
        });
    });