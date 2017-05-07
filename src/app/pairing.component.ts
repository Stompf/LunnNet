import { Component } from '@angular/core';

@Component({
    moduleId: module.id,
    selector: 'app-pairing',
    templateUrl: './pairing.component.html'
})

export class PairingComponent {
    food = 'Katarina';

    foodInput(event: Event) {
        const target = event.target as HTMLInputElement;
        this.food = target.value;
    }
}
