import { Component, inject, output, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { NabdService } from '../../../../core/services/nabd';
import { Post } from '../../../../core/models/nabd/post.model';

@Component({
  selector: 'app-create-post',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './create-post.html',
  styleUrl: './create-post.scss'
})
export class CreatePostComponent {
  private readonly nabdService = inject(NabdService);
  private readonly fb = inject(FormBuilder);

  postCreated = output<Post>();
  isLoading = signal(false);
  isExpanded = signal(false);

  form = this.fb.group({
    content: ['', [Validators.required, Validators.maxLength(2000)]]
  });

  expand(): void { this.isExpanded.set(true); }

  cancel(): void {
    this.isExpanded.set(false);
    this.form.reset();
  }

  submit(): void {
    if (this.form.invalid) return;
    this.isLoading.set(true);

    this.nabdService.createPost({ content: this.form.value.content! }).subscribe({
      next: post => {
        this.postCreated.emit(post);
        this.form.reset();
        this.isExpanded.set(false);
        this.isLoading.set(false);
      },
      error: () => this.isLoading.set(false)
    });
  }
}