import { ComponentFixture, TestBed } from '@angular/core/testing';
import { InicioMedico } from './inicio-medico.component';

describe('InicioMedico', () => {
  let component: InicioMedico;
  let fixture: ComponentFixture<InicioMedico>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InicioMedico],
    }).compileComponents();

    fixture = TestBed.createComponent(InicioMedico);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
