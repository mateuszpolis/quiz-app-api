import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuizService } from './quiz.service';
import { QuizResolver } from './quiz.resolver';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { UserAnswer } from './entities/user-answer.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Question, Answer, UserAnswer])],
  providers: [QuizService, QuizResolver],
})
export class QuizModule {}
