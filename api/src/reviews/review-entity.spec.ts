import { Review } from './review.entity';

describe('Review', () => {
  describe('ensureRatingNonNegative', () => {
    it('should set rating to 0 if it is negative', () => {
      const review = new Review();
      review.rating = -10;
      review.ensureRatingNonNegative();
      expect(review.rating).toBe(0);
    });

    it('should keep rating as is if it is positive', () => {
      const review = new Review();
      review.rating = 5;
      review.ensureRatingNonNegative();
      expect(review.rating).toBe(5);
    });
  });
  // Additional tests for other methods and hooks...
});