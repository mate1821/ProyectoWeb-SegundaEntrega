import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DetallesReserva } from './detalles-reserva.component';

describe('DetallesReserva', () => {
  let component: DetallesReserva;
  let fixture: ComponentFixture<DetallesReserva>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DetallesReserva],
    }).compileComponents();

    fixture = TestBed.createComponent(DetallesReserva);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
