import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoalNew } from './goal-new';

describe('GoalNew', () => {
  let component: GoalNew;
  let fixture: ComponentFixture<GoalNew>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalNew],
    }).compileComponents();

    fixture = TestBed.createComponent(GoalNew);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
