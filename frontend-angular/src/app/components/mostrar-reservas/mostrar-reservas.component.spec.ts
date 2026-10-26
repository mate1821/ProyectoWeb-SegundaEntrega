import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MostrarReservas } from './mostrar-reservas.component';

describe('MostrarReservas', () => {
  let component: MostrarReservas;
  let fixture: ComponentFixture<MostrarReservas>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MostrarReservas],
    }).compileComponents();

    fixture = TestBed.createComponent(MostrarReservas);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
